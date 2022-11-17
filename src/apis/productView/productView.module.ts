import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity';
import { ProductView } from './entities/productView.entity';
import { ProductViewResolver } from './productView.resolver';
import { ProductViewService } from './productView.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductView, Product])],
  providers: [ProductViewResolver, ProductViewService],
})
export class ProductViewModule {}
