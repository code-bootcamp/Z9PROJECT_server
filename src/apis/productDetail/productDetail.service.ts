import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductDetail } from './entities/productDetail.entity';

@Injectable()
export class ProductDetailService {
  constructor(
    @InjectRepository(ProductDetail)
    private readonly productDetailRepository: Repository<ProductDetail>,
  ) {}

  async findDetail({ productId }) {
    return await this.productDetailRepository
      .createQueryBuilder('productDetail')
      .where('productDetail.product = :productId', { productId })
      .getOne();
  }

  async createDetail({ productId, ...rest }) {
    const productDetail = this.productDetailRepository.create({
      product: { id: productId },
      ...rest,
    });

    return await this.productDetailRepository.save(productDetail);
  }

  async updateDetail({ productId, ...rest }) {
    const productDetail = await this.findDetail({ productId });

    if (!productDetail) {
      throw new UnprocessableEntityException('Product detail not found');
    }

    const updatedProductDetail = this.productDetailRepository.merge(
      productDetail,
      rest,
    );

    return await this.productDetailRepository.save(updatedProductDetail);
  }

  async deleteDetail({ productId }) {
    const productDetail = await this.findDetail({ productId });

    if (!productDetail) {
      throw new UnprocessableEntityException('Product detail not found');
    }

    return await this.productDetailRepository.remove(productDetail);
  }
}
