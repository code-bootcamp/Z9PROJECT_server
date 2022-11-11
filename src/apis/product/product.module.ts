import { UsersService } from './../users/users.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductDetail } from '../productDetail/entities/productDetail.entity';
import { ProductDetailService } from '../productDetail/productDetail.service';
import { Product } from './entities/product.entity';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product, //
      ProductDetail,
      User,
    ]),
  ],
  providers: [
    ProductResolver,
    ProductService,
    ProductDetailService,
    UsersService,
  ],
})
export class ProductModule {}
