import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ProductLike } from './entities/productLike.entity';
import { ProductLikeService } from './productLike.service';
import { ProductLikeResolver } from './productLike.resolver';
import { ProductService } from '../product/product.service';
import { Product } from '../product/entities/product.entity';
import { ProductDetailService } from '../productDetail/productDetail.service';
import { UsersService } from '../users/users.service';
import { ProductResolver } from '../product/product.resolver';
import { ProductDetail } from '../productDetail/entities/productDetail.entity';
import { User } from '../users/entities/user.entity';

// TODO: Fix Imports
@Module({
  imports: [
    TypeOrmModule.forFeature([ProductLike, Product, ProductDetail, User]),
  ],
  providers: [
    ProductLikeService,
    ProductLikeResolver,
    ProductService,
    ProductResolver,
    ProductDetailService,
    UsersService,
  ],
})
export class ProductLikeModule {}
