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
import { ISmsToken } from 'src/common/types/auth.types';

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

  async findOneByLoginId(loginId) {
    return this.usersRepository.findOne({ where: { loginId } });
  }

  private async checkSmsAuthNumber(phoneNumber: string) {
    const cacheResult: string = await this.cacheManager.get(
      `smsToken:${phoneNumber}`,
    );

    const smsToken: ISmsToken = JSON.parse(cacheResult);
    if (!smsToken || !smsToken.isAuth) return false;

    return true;
  }

  async create(createUserInput: CreateUserInput) {
    const user = await this.usersRepository.findOne({
      where: { loginId: createUserInput.loginId },
    });
    if (user) throw new ConflictException('이미 등록된 이메일입니다.');

    const isValidSmsAuth = await this.checkSmsAuthNumber(createUserInput.phone);
    if (!isValidSmsAuth) {
      throw new UnprocessableEntityException(
        '핸드폰 번호가 인증되지 않았거나 존재하지 않습니다',
      );
    }

    createUserInput.loginPassword = await this.encryptPassword(
      createUserInput.loginPassword,
    );

    return this.usersRepository.save(createUserInput);
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
