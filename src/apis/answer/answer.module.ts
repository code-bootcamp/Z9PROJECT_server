import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity';
import { ProductService } from '../product/product.service';
import { ProductDetail } from '../productDetail/entities/productDetail.entity';
import { ProductDetailService } from '../productDetail/productDetail.service';
import { Question } from '../question/entities/question.entity';
import { QuestionService } from '../question/question.service';
import { User } from '../users/entities/user.entity';
import { QuestionService } from '../question/question.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AnswerResolver } from './answer.resolver';
import { AnswerService } from './answer.service';
import { Answer } from './entites/answer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, //
      Answer,
      Question,
      Product,
      ProductDetail,
    ]),
  ],
  providers: [
    UsersService,
    AnswerResolver, //
    AnswerService,
    QuestionService,
    ProductService,
    ProductDetailService,
  ],
})
export class AnswerModule {}
