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
    //LOGGING
    console.log(new Date(), ' | ProductDetailService.findDetail()');

    return await this.productDetailRepository
      .createQueryBuilder('productDetail')
      .where('productDetail.product = :productId', { productId })
      .getOne();
  }

  async createDetail({ productId, ...rest }) {
    //LOGGING
    console.log(new Date(), ' | ProductDetailService.createDetail()');

    const productDetail = this.productDetailRepository.create({
      product: { id: productId },
      ...rest,
    });

    return await this.productDetailRepository.save(productDetail);
  }

  async updateDetail({ productId, ...rest }) {
    //LOGGING
    console.log(new Date(), ' | ProductDetailService.updateDetail()');

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
    //LOGGING
    console.log(new Date(), ' | ProductDetailService.deleteDetail()');

    const productDetail = await this.findDetail({ productId });

    if (!productDetail) {
      throw new UnprocessableEntityException('Product detail not found');
    }

    return await this.productDetailRepository.remove(productDetail);
  }
}
