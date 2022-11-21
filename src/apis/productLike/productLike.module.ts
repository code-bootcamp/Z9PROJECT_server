import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ProductLike } from './entities/productLike.entity';
import { ProductLikeService } from './productLike.service';
import { ProductLikeResolver } from './productLike.resolver';
import { ProductService } from '../product/product.service';
import { Product } from '../product/entities/product.entity';
import { ProductDetail } from '../productDetail/entities/productDetail.entity';
import { ProductDetailService } from '../productDetail/productDetail.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { Point } from '../points/entities/point.entity';
import { PointsService } from '../points/points.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductLike,
      Product,
      ProductDetail,
      User,
      Order,
      Point,
    ]),
  ],
  providers: [
    ProductLikeResolver,
    ProductLikeService,
    ProductService,
    ProductDetailService,
    UsersService,
    PointsService,
  ],
})
export class ProductLikeModule {}
