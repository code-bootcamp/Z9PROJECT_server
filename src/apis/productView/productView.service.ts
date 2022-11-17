import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { ProductView } from './entities/productView.entity';

@Injectable()
export class ProductViewService {
  constructor(
    @InjectRepository(ProductView)
    private readonly productViewRepository: Repository<ProductView>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async addView({ productId }): Promise<number> {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .where('product.id = :productId', { productId })
      .getOne();
    const isExist = await this.productViewRepository
      .createQueryBuilder('productView')
      .leftJoinAndSelect('productView.product', 'product')
      .where('product.id = :productId', { productId })
      .getOne();

    if (isExist) {
      isExist.viewCount += 1;
      const productView = await this.productViewRepository.save(isExist);
      return productView.viewCount;
    } else {
      const productViewData = this.productViewRepository.create({
        viewCount: 1,
        product,
      });
      const productView = await this.productViewRepository.save(
        productViewData,
      );
      return productView.viewCount;
    }
  }

  async getViews({ productId }): Promise<number> {
    const productView = await this.productViewRepository
      .createQueryBuilder('productView')
      .leftJoinAndSelect('productView.product', 'product')
      .where('product.id = :productId', { productId })
      .getOne();

    if (productView) {
      return productView.viewCount;
    } else {
      return 0;
    }
  }
}
