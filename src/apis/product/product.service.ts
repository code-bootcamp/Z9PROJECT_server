import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import axios from 'axios';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findOne({ productId }) {
    return await this.productRepository.findOne({ where: { id: productId } });
  }

  async findAll() {
    return await this.productRepository.find();
  }

  async create({ createProductInput }) {
    const discountRate = Math.ceil(
      ((createProductInput.originPrice - createProductInput.discountPrice) /
        createProductInput.originPrice) *
        100,
    );
    createProductInput.discountRate = discountRate;
    const result = await this.productRepository.save({
      ...createProductInput,
    });
    return result;
  }

  async update({ productId, updateProductInput }) {
    const updateProduct = await this.productRepository.findOne({
      where: { id: productId },
    });

    const { discountRate, ...rest } = updateProductInput;

    const newProduct = {
      ...updateProduct,
      id: productId,
      ...rest,
    };

    return await this.productRepository.save(newProduct);
  }

  async checkSoldout({ productId }) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (product.isSoldout)
      throw new UnprocessableEntityException('이미 판매 완료된 상품입니다.');
  }

  async checkBussinessNumber({ createProductInput }) {
    const { businessRegistraionNumber } = createProductInput;
    const url = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${process.env.SERVICEKEY}`;
    const isValidation = await axios
      .post(url, {
        b_no: [businessRegistraionNumber],
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
