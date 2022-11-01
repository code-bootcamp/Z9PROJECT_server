import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserInput } from './dto/createUser.input';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private readonly encryptPassword = async (inputPassword): Promise<string> => {
    return await bcrypt.hash(inputPassword, parseInt(process.env.BCRYPT_SALT));
  };

  async findOne(loginId) {
    return this.usersRepository.findOne({ where: { loginId } });
  }

  async create(createUserInput: CreateUserInput) {
    const user = await this.usersRepository.findOne({
      where: { loginId: createUserInput.loginId },
    });
    if (user) throw new ConflictException('이미 등록된 이메일입니다.');

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
}
