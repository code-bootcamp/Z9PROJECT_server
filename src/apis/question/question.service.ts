import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { skip } from 'rxjs';
import { Repository } from 'typeorm';
import { Answer } from '../answer/entites/answer.entity';
import { Product } from '../product/entities/product.entity';
import { ProductService } from '../product/product.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import {
  Question,
  QUESTION_STATUS_TYPE_ENUM,
} from './entities/question.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,

    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,

    private readonly productSerivce: ProductService,

    private readonly userSerivce: UsersService,
  ) {}

  async create({ createQuestionInput }) {
    //LOGGING
    console.log(new Date(), ' | QuestionService.create()');

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

  async findAll({ productId, page }): Promise<Question[]> {
    //LOGGING
    console.log(new Date(), ' | QuestionService.findAll()');

    const result = await this.questionRepository.find({
      where: { product: { id: productId } },
      order: {
        createdAt: 'desc',
      },
      withDeleted: true,
      relations: ['user', 'product'],
      skip: (page - 1) * 5,
      take: 5,
      cache: true,
    });

    console.log(result);
    return result;
  }

  async findCountQuestions({ productId }) {
    //LOGGING
    console.log(new Date(), ' | QuestionService.findCountQuestions()');

    return await this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.product', 'product')
      .where('question.product = :productId', { productId })
      .getCount();
  }

  async findOne({ questionId }): Promise<Question> {
    //LOGGING
    console.log(new Date(), ' | QuestionService.findOne()');

    return await this.questionRepository.findOne({
      where: { id: questionId },
      withDeleted: true,
      relations: ['user', 'product', 'answer'],
    });
  }

  async findByMyQuestion({ userId }) {
    //LOGGING
    console.log(new Date(), ' | QuestionService.findByMyQuestion()');

    const result = await this.questionRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'product', 'answer'],
    });
    console.log(userId, result);
    return result;
  }

  async update({ questionId, updateQuestionInput }): Promise<Question> {
    //LOGGING
    console.log(new Date(), ' | QuestionService.update()');

    const question = await this.questionRepository
      .createQueryBuilder('question')
      .where('question.id = :questionId', { questionId })
      .getOne();
    const { answerId, ...rest } = updateQuestionInput;
    const answer = await this.answerRepository
      .createQueryBuilder('answer')
      .where('answer.id = :answerId', { answerId })
      .getOne();

    const newQuestsion: Question = {
      ...question,
      answer,
      ...rest,
    };
    return await this.questionRepository.save(newQuestsion);
  }

  async remove({ questionId }): Promise<boolean> {
    //LOGGING
    console.log(new Date(), ' | QuestionService.remove()');

    const result = await this.questionRepository.softDelete({ id: questionId });
    return result.affected ? true : false;
  }

  async checkAnswer({ questionId }) {
    const status = await this.questionRepository.findOne({
      where: {
        id: questionId,
        status: QUESTION_STATUS_TYPE_ENUM.SOLVED,
      },
    });
    if (status)
      throw new UnprocessableEntityException(
        '답변이 완료된 질문은 삭제 할 수 없습니다.',
      );
  }

  async checkUpdate({ questionId }) {
    const status = await this.questionRepository.findOne({
      where: {
        id: questionId,
        status: QUESTION_STATUS_TYPE_ENUM.SOLVED,
      },
    });
    if (status)
      throw new UnprocessableEntityException(
        '답변이 완료된 질문은 수정 할 수 없습니다.',
      );
  }
}
