import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { ProductService } from '../product/product.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Question } from './entities/question.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,

    private readonly productSerivce: ProductService,

    private readonly userSerivce: UsersService,
  ) {}

  async create({ createQuestionInput }) {
    //LOGGING
    console.log('QuestionService.create()');

    const { userId, productId, ...question } = createQuestionInput;

    const user: User = await this.userSerivce.findOneByUserId(userId);

    const product: Product = await this.productSerivce.findOne({ productId });

    const result: Question = await this.questionRepository.save({
      ...question,
      product,
      user,
    });
    return result;
  }

  async findAll(): Promise<Question[]> {
    //LOGGING
    console.log('QuestionService.findAll()');

    return await this.questionRepository.find({
      relations: ['user', 'product'],
    });
  }

  async findOne({ questionId }): Promise<Question> {
    //LOGGING
    console.log('QuestionService.findOne()');

    return await this.questionRepository.findOne({
      where: { id: questionId },
      relations: ['user', 'product'],
    });
  }

  async update({ questionId, updateQuestionInput }): Promise<Question> {
    //LOGGING
    console.log('QuestionService.update()');

    const newQuestsion: Question = {
      ...updateQuestionInput,
      id: questionId,
    };
    return await this.questionRepository.save(newQuestsion);
  }

  async remove({ questionId }): Promise<boolean> {
    //LOGGING
    console.log('QuestionService.remove()');

    const result = await this.questionRepository.softDelete({ id: questionId });
    return result.affected ? true : false;
  }
}
