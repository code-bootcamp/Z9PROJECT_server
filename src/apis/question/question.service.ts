import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductService } from '../product/product.service';
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

  async create({ createQuestionInput, productId, email }) {
    const product = await this.productSerivce.findOne({ productId });

    const user = await this.userSerivce.findOneByEmail({ email });

    return this.questionRepository.save({
      ...createQuestionInput,
      product,
      user,
    });
  }
}
