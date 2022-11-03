import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ProductLike } from './entities/productLike.entity';
import { ProductLikeService } from './productLike.service';
import { ProductLikeResolver } from './productLike.resolver';
import { User } from '../users/entities/user.entity';
import { Product } from '../product/entities/product.entity';

// TODO: Fix Imports
@Module({
  imports: [TypeOrmModule.forFeature([ProductLike, User, Product])],
  providers: [ProductLikeService, ProductLikeResolver],
})
export class ProductLikeModule {}
