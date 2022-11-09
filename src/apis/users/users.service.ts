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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

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

  async findOneByNickName(nickname) {
    return this.usersRepository.findOne({ where: { nickname } });
  }

  async isSameLoginPassword(userId, password) {
    const user = await this.findOneByUserId(userId);
    return await bcrypt.compare(password, user.password);
  }

  private async checkSmsAuth(phoneNumber: string, signupId: string) {
    const smsToken: ISmsToken = await this.cacheManager.get(
      SMS_TOKEN_KEY_PREFIX + phoneNumber,
    );

    console.log(
      '회원가입 단계의 레디스 키:',
      SMS_TOKEN_KEY_PREFIX + phoneNumber,
    );
    console.log('smsToken:', smsToken, 'smsToken.isAuth:', smsToken?.isAuth);
    console.log(
      'smsToken.signupId:',
      smsToken?.signupId,
      'signupId:',
      signupId,
    );

    if (!smsToken || !smsToken?.isAuth || smsToken?.signupId !== signupId)
      return false;

    await this.cacheManager.del(SMS_TOKEN_KEY_PREFIX + phoneNumber);

    return true;
  }

  async checkUserBeforeCreate(
    signupId: string,
    createUserInput: CreateUserInput,
  ) {
    const user = await this.usersRepository.findOne({
      where: { email: createUserInput.email },
    });
    if (user) throw new ConflictException('이미 등록된 아이디입니다.');

    const isValidSmsAuth = await this.checkSmsAuth(
      createUserInput.phoneNumber,
      signupId,
    );
    if (!isValidSmsAuth) {
      throw new UnprocessableEntityException(
        '핸드폰 번호가 인증되지 않았거나 존재하지 않습니다',
      );
    }
  }

  async createUserInFinalStep(createUserInput: CreateUserInput) {
    createUserInput.password = await this.encryptPassword(
      createUserInput.password,
    );
    return await this.usersRepository.save(createUserInput);
  }

  async create(signupId: string, createUserInput: CreateUserInput) {
    await this.checkUserBeforeCreate(signupId, createUserInput);

    createUserInput.password = await this.encryptPassword(
      createUserInput.password,
    );

    return await this.createUserInFinalStep(createUserInput);
  }

  async update({ userId, updateUserInput }) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (updateUserInput.password) {
      updateUserInput.password = await this.encryptPassword(
        updateUserInput.password,
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
