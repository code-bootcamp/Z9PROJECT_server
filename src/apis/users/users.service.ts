import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
  CACHE_MANAGER,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserInput } from './dto/createUser.input';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { ISmsToken, SMS_TOKEN_KEY_PREFIX } from 'src/common/types/auth.types';
import { Image } from '../images/entities/image.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    // @InjectRepository(Image)
    // private readonly imageRepository: Repository<Image>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private readonly encryptPassword = async (inputPassword): Promise<string> => {
    return await bcrypt.hash(inputPassword, parseInt(process.env.BCRYPT_SALT));
  };

  async findOneByUserId(userId) {
    return this.usersRepository.findOne({ where: { id: userId } });
  }

  async findOneByEmail(email) {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOneByNickName(nickName) {
    return this.usersRepository.findOne({ where: { nickName } });
  }

  async isSameLoginPassword(userId, password) {
    const user = await this.findOneByUserId(userId);
    return await bcrypt.compare(password, user.loginPassword);
  }

  private async checkSmsAuth(phoneNumber: string, createUserStepId: string) {
    const smsToken: ISmsToken = await this.cacheManager.get(
      SMS_TOKEN_KEY_PREFIX + phoneNumber,
    );

    if (
      !smsToken ||
      !smsToken.isAuth ||
      smsToken.createUserStepId !== createUserStepId
    )
      return false;

    await this.cacheManager.del(SMS_TOKEN_KEY_PREFIX + phoneNumber);

    return true;
  }

  async checkUserBeforeCreate(
    createUserStepId: string,
    createUserInput: CreateUserInput,
  ) {
    const user = await this.usersRepository.findOne({
      where: { email: createUserInput.email },
    });
    if (user) throw new ConflictException('이미 등록된 아이디입니다.');

    const isValidSmsAuth = await this.checkSmsAuth(
      createUserInput.phoneNumber,
      createUserStepId,
    );
    if (!isValidSmsAuth) {
      throw new UnprocessableEntityException(
        '핸드폰 번호가 인증되지 않았거나 존재하지 않습니다',
      );
    }
  }

  async createUserInFinalStep(createUserInput: CreateUserInput) {
    createUserInput.loginPassword = await this.encryptPassword(
      createUserInput.loginPassword,
    );
    return await this.usersRepository.save(createUserInput);
  }

  async create(createUserStepId: string, createUserInput: CreateUserInput) {
    await this.checkUserBeforeCreate(createUserStepId, createUserInput);

    createUserInput.loginPassword = await this.encryptPassword(
      createUserInput.loginPassword,
    );

    return await this.createUserInFinalStep(createUserInput);
  }

  async update({ userId, updateUserInput }) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (updateUserInput.loginPassword) {
      updateUserInput.loginPassword = await this.encryptPassword(
        updateUserInput.loginPassword,
      );
    }

    const result = this.usersRepository.save({
      ...user,
      ...updateUserInput,
    });

    return result;
  }

  async delete(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user)
      throw new UnprocessableEntityException(
        '해당 유저 정보를 찾을 수 없습니다.',
      );

    const result = await this.usersRepository.delete({
      id: userId,
    });
    return result.affected ? true : false;
  }
}
