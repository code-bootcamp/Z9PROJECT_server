import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ProductLike } from './entities/productLike.entity';
import { ProductLikeService } from './productLike.service';
import { ProductLikeResolver } from './productLike.resolver';

// TODO: Fix Imports
@Module({
  imports: [TypeOrmModule.forFeature([ProductLike])],
  providers: [ProductLikeService, ProductLikeResolver],
})
export class ProductLikeModule {}
