import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Point } from '../points/entities/point.entity';
import { PointsService } from '../points/points.service';
import { Product } from '../product/entities/product.entity';
import { ProductService } from '../product/product.service';
import { ProductDetail } from '../productDetail/entities/productDetail.entity';
import { ProductDetailService } from '../productDetail/productDetail.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Order } from './entities/order.entity';
import { OrdersResolver } from './orders.resolver';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Point, User, Product, ProductDetail]),
  ],
  providers: [
    OrdersResolver,
    OrdersService,
    UsersService,
    ProductService,
    PointsService,
    ProductDetailService,
  ],
})
export class OrdersModule {}
