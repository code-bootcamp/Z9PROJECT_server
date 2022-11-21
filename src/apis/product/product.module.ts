import { UsersService } from './../users/users.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductDetail } from '../productDetail/entities/productDetail.entity';
import { ProductDetailService } from '../productDetail/productDetail.service';
import { Product } from './entities/product.entity';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { Point } from '../points/entities/point.entity';
import { PointsService } from '../points/points.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product, //
      ProductDetail,
      User,
      Order,
      Point,
    ]),
  ],
  providers: [
    ProductResolver,
    ProductService,
    ProductDetailService,
    UsersService,
    PointsService,
  ],
})
export class ProductModule {}
