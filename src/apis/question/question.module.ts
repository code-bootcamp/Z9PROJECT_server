import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from '../answer/entites/answer.entity';
import { Product } from '../product/entities/product.entity';
import { ProductService } from '../product/product.service';
import { ProductDetail } from '../productDetail/entities/productDetail.entity';
import { ProductDetailService } from '../productDetail/productDetail.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Question } from './entities/question.entity';
import { QuestionResolver } from './question.resolver';
import { QuestionService } from './question.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question, //
      Product,
      User,
      ProductDetail,
      Answer,
    ]),
  ],
  providers: [
    QuestionService, //
    QuestionResolver,
    ProductService,
    UsersService,
    ProductDetailService,
  ],
})
export class QuestionModule {}
