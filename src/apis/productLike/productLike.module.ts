import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ProductLike } from './entities/productLike.entity';
import { ProductLikeService } from './productLike.service';
import { ProductLikeResolver } from './productLike.resolver';
import { ProductService } from '../product/product.service';
import { Product } from '../product/entities/product.entity';

// TODO: Fix Imports
@Module({
  imports: [TypeOrmModule.forFeature([ProductLike, Product])],
  providers: [ProductLikeService, ProductLikeResolver, ProductService],
})
export class ProductLikeModule {}
