import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Answer } from './entites/answer.entity';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(Answer)
    private readonly AnswerRepository: Repository<Answer>,

    private readonly userSerivce: UsersService,
  ) {}

  async create({ createAnswerInput, question }) {
    const { userId, ...answer } = createAnswerInput;

    const user: User = await this.userSerivce.findOneByUserId(userId);

    const result = await this.AnswerRepository.save({
      ...answer,
      user,
      question,
    });
    return result;
  }

  async findAll(): Promise<Answer[]> {
    return await this.AnswerRepository.find({
      relations: ['user'],
    });
  }

  async findOne({ answerId }): Promise<Answer> {
    return await this.AnswerRepository.findOne({
      where: { id: answerId },
      relations: ['user'],
    });
  }

  async findAllByQuestion({ questionId }) {
    return await this.AnswerRepository.find({
      relations: ['question'],
      where: { question: { id: questionId } },
    });
  }

  async update({ answerId, updateAnswerInput }): Promise<Answer> {
    const newQuestsion: Answer = {
      ...updateAnswerInput,
      id: answerId,
    };
    return await this.AnswerRepository.save(newQuestsion);
  }

  async remove({ answerId }): Promise<boolean> {
    const result = await this.AnswerRepository.softDelete({ id: answerId });
    return result.affected ? true : false;
  }
}
