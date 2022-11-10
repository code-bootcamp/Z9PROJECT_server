import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductDetail } from '../productDetail/entities/productDetail.entity';
import { ProductDetailService } from '../productDetail/productDetail.service';
import { Product } from './entities/product.entity';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product, //
      ProductDetail,
    ]),
  ],
  providers: [ProductResolver, ProductService, ProductDetailService],
})
export class ProductModule {}
