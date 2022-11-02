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

  async findOne(loginId) {
    return this.usersRepository.findOne({ where: { loginId } });
  }

  async create(createUserInput: CreateUserInput) {
    const user = await this.usersRepository.findOne({
      where: { loginId: createUserInput.loginId },
    });
    if (user) throw new ConflictException('이미 등록된 이메일입니다.');

    createUserInput.loginPassword = await bcrypt.hash(
      createUserInput.loginPassword,
      10,
    );

    return this.usersRepository.save(createUserInput);
  }
}
