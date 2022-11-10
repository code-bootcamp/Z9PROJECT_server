import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import axios from 'axios';
import { ProductDetailService } from '../productDetail/productDetail.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productDetailService: ProductDetailService,
  ) {}

  async findOne({ productId }) {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .where('product.id = :productId', { productId })
      .leftJoinAndSelect('product.productDetail', 'productDetail')
      .getOne();
  }

  async countProductByUserId({ userId }) {
    return await this.productRepository
      .createQueryBuilder('product')
      .where('product.user = :userId', { userId })
      .getCount();
  }

  async findAll() {
    return await this.productRepository.find();
  }

  async create({ createProductInput, createProductDetailInput }) {
    const calcDiscountRate: number =
      createProductInput.discountPrice !== null
        ? Math.ceil(
            ((createProductInput.originPrice -
              createProductInput.discountPrice) /
              createProductInput.originPrice) *
              100,
          )
        : 0;

    const { discountRate, ...product } = createProductInput;

    const result: Product = await this.productRepository.save({
      ...product,
      discoutRate: calcDiscountRate,
    });

    await this.productDetailService.createDetail({
      productId: result.id,
      ...createProductDetailInput,
    });

    return result;
  }

  async update({ productId, updateProductInput, updateProductDetailInput }) {
    const updateProduct: Product = await this.productRepository
      .createQueryBuilder('product')
      .where('product.id = :productId', { productId })
      .getOne();

    const calcDiscountRate: number =
      updateProductInput.discountPrice !== null
        ? Math.ceil(
            ((updateProductInput.originPrice -
              updateProductInput.discountPrice) /
              updateProductInput.originPrice) *
              100,
          )
        : 0;

    const { discountRate, ...rest } = updateProductInput;

    const newProduct: Product = {
      ...updateProduct,
      id: productId,
      discountRate: calcDiscountRate,
      ...rest,
    };

    await this.productDetailService.updateDetail({
      productId,
      ...updateProductDetailInput,
    });

    return await this.productRepository.save(newProduct);
  }

  async checkSoldout({ productId }): Promise<Product> {
    const product: Product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (product.isSoldout)
      throw new UnprocessableEntityException('이미 판매 완료된 상품입니다.');

    return product;
  }

  async delete({ productId }) {
    await this.productRepository.softDelete({ id: productId }).catch(() => {
      throw new UnprocessableEntityException('삭제 실패');
    });
    await this.productDetailService.deleteDetail({ productId }).catch(() => {
      throw new UnprocessableEntityException('삭제 실패');
    });
    return true;
  }

  async checkBussinessNumber({ createProductInput }) {
    const { brn } = createProductInput;
    const url = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${process.env.SERVICEKEY}`;
    const isValidation = await axios
      .post(url, {
        b_no: [brn],
      })
      .catch((e) => console.error(e));

    if (
      isValidation['data'].data[0].tax_type ===
      '국세청에 등록되지 않은 사업자등록번호입니다.'
    )
      throw new UnprocessableEntityException(
        '국세청에 등록되지 않은 사업자등록번호입니다.',
      );
  }
}
