import { UsersService } from './../users/users.service';
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import axios from 'axios';
import { ProductDetailService } from '../productDetail/productDetail.service';
import { ProductDetail } from '../productDetail/entities/productDetail.entity';
import { registerEnumType } from '@nestjs/graphql';

export enum PRODUCT_SEARCH_TYPE {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
  ALL = 'ALL',
}

export enum PRODUCT_INCLUDE_OPTION {
  INCLUDE_SOLDED_OUT = 'INCLUDE_SOLDED_OUT',
  EXCLUDE_SOLDED_OUT = 'EXCLUDE_SOLDED_OUT',
}

registerEnumType(PRODUCT_SEARCH_TYPE, {
  name: 'PRODUCT_SEARCH_TYPE',
});

registerEnumType(PRODUCT_INCLUDE_OPTION, {
  name: 'PRODUCT_INCLUDE_OPTION',
});

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productDetailService: ProductDetailService,
    private readonly usersService: UsersService,
  ) {}

  async findOne({ productId }) {
    //LOGGING
    console.log(new Date(), ' | ProductService.findOne()');

    const result = await this.productRepository
      .createQueryBuilder('product')
      .where('product.id = :productId', { productId })
      .leftJoinAndSelect('product.productDetail', 'productDetail')
      .getOne();
    return result;
  }

  async countProductByUserId({ userId }) {
    //LOGGING
    console.log(new Date(), ' | ProductService.countProductByUserId()');

    return await this.productRepository
      .createQueryBuilder('product')
      .where('product.user = :userId', { userId })
      .getCount();
  }

  async findProductByStatus({
    type,
    option,
  }: {
    type: PRODUCT_SEARCH_TYPE;
    option: PRODUCT_INCLUDE_OPTION;
  }) {
    //LOGGING
    console.log(new Date(), ' | ProductService.findProductByStatus()');

    if (type === PRODUCT_SEARCH_TYPE.ALL) {
      if (option === PRODUCT_INCLUDE_OPTION.INCLUDE_SOLDED_OUT) {
        return await this.productRepository
          .createQueryBuilder('product')
          .leftJoinAndSelect('product.productDetail', 'productDetail')
          .getMany();
      } else if (option === PRODUCT_INCLUDE_OPTION.EXCLUDE_SOLDED_OUT) {
        return await this.productRepository
          .createQueryBuilder('product')
          .where('product.isSoldout = :isSoldout', { isSoldout: false })
          .leftJoinAndSelect('product.productDetail', 'productDetail')
          .getMany();
      } else {
        throw new UnprocessableEntityException('Invalid option');
      }
    } else if (type === PRODUCT_SEARCH_TYPE.PENDING) {
      if (option === PRODUCT_INCLUDE_OPTION.INCLUDE_SOLDED_OUT) {
        return await this.productRepository
          .createQueryBuilder('product')
          .where('product.validFrom > :now', { now: new Date() })
          .leftJoinAndSelect('product.productDetail', 'productDetail')
          .getMany();
      } else if (option === PRODUCT_INCLUDE_OPTION.EXCLUDE_SOLDED_OUT) {
        return await this.productRepository
          .createQueryBuilder('product')
          .where('product.validFrom > :now', { now: new Date() })
          .andWhere('product.isSoldout = :isSoldout', { isSoldout: false })
          .leftJoinAndSelect('product.productDetail', 'productDetail')
          .getMany();
      } else {
        throw new UnprocessableEntityException('Invalid option');
      }
    } else if (type === PRODUCT_SEARCH_TYPE.IN_PROGRESS) {
      if (option === PRODUCT_INCLUDE_OPTION.INCLUDE_SOLDED_OUT) {
        return await this.productRepository
          .createQueryBuilder('product')
          .where('product.validFrom <= :now', { now: new Date() })
          .andWhere('product.validUntil >= :now', { now: new Date() })
          .leftJoinAndSelect('product.productDetail', 'productDetail')
          .getMany();
      } else if (option === PRODUCT_INCLUDE_OPTION.EXCLUDE_SOLDED_OUT) {
        return await this.productRepository
          .createQueryBuilder('product')
          .where('product.validFrom <= :now', { now: new Date() })
          .andWhere('product.validUntil >= :now', { now: new Date() })
          .andWhere('product.isSoldout = :isSoldout', { isSoldout: false })
          .leftJoinAndSelect('product.productDetail', 'productDetail')
          .getMany();
      } else {
        throw new UnprocessableEntityException('Invalid option');
      }
    } else if (type === PRODUCT_SEARCH_TYPE.FINISHED) {
      if (option === PRODUCT_INCLUDE_OPTION.INCLUDE_SOLDED_OUT) {
        return await this.productRepository
          .createQueryBuilder('product')
          .where('product.validUntil < :now', { now: new Date() })
          .leftJoinAndSelect('product.productDetail', 'productDetail')
          .getMany();
      } else if (option === PRODUCT_INCLUDE_OPTION.EXCLUDE_SOLDED_OUT) {
        return await this.productRepository
          .createQueryBuilder('product')
          .where('product.validUntil < :now', { now: new Date() })
          .andWhere('product.isSoldout = :isSoldout', { isSoldout: false })
          .leftJoinAndSelect('product.productDetail', 'productDetail')
          .getMany();
      } else {
        throw new UnprocessableEntityException('Invalid option');
      }
    } else {
      throw new UnprocessableEntityException('Invalid type');
    }
  }

  async findProductByCreator({ name }) {
    //LOGGING
    console.log(new Date(), ' | ProductService.findProductByCreator()');

    const user = await this.usersService.findOneByNickName(name);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.productRepository
      .createQueryBuilder('product')
      .where('product.user = :userId', { userId: user.id })
      .leftJoinAndSelect('product.productDetail', 'productDetail')
      .getMany();
  }

  async findAll() {
    //LOGGING
    console.log(new Date(), ' | ProductService.findAll()');

    return await this.productRepository.find();
  }

  async create({ userId, createProductInput, createProductDetailInput }) {
    //LOGGING
    console.log(new Date(), ' | ProductService.create()');

    const calcDiscountRate: number =
      createProductInput.discountPrice !== null
        ? Math.ceil(
            ((createProductInput.originPrice -
              createProductInput.discountPrice) /
              createProductInput.originPrice) *
              100,
          )
        : 0;
    const user = await this.usersService.findOneByUserId(userId);
    const { discountRate, images, ...product } = createProductInput;
    console.log(calcDiscountRate);
    console.log(images);
    console.log(product);
    const savedProduct: Product = await this.productRepository.save({
      ...product,
      images: images,
      user,
      discountRate: calcDiscountRate,
    });

    const savedDetail: ProductDetail =
      await this.productDetailService.createDetail({
        productId: savedProduct.id,
        ...createProductDetailInput,
      });

    return { ...savedProduct, productDetail: savedDetail };
  }

  async update({ productId, updateProductInput, updateProductDetailInput }) {
    //LOGGING
    console.log(new Date(), ' | ProductService.update()');

    const originProduct: Product = await this.productRepository
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

    if (updateProductInput.images == null) {
      updateProductInput.images = originProduct.images;
    }
    const { discountRate, images, ...product } = updateProductInput;

    const newProduct: Product = await this.productRepository.save({
      ...originProduct,
      images: images,
      discountRate: calcDiscountRate,
      ...product,
    });

    const newProductDetail = await this.productDetailService.updateDetail({
      productId,
      ...updateProductDetailInput,
    });

    return { ...newProduct, productDetail: newProductDetail };
  }

  async checkSoldout({ productId }): Promise<Product> {
    //LOGGING
    console.log(new Date(), ' | ProductService.checkSoldout()');

    const product: Product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (product.isSoldout)
      throw new UnprocessableEntityException('이미 판매 완료된 상품입니다.');

    return product;
  }

  async delete({ productId }) {
    //LOGGING
    console.log(new Date(), ' | ProductService.delete()');

    await this.productRepository.softDelete({ id: productId }).catch(() => {
      throw new UnprocessableEntityException('삭제 실패');
    });
    await this.productDetailService.deleteDetail({ productId }).catch(() => {
      throw new UnprocessableEntityException('삭제 실패');
    });
    return true;
  }

  async checkBussinessNumber({ createProductInput }) {
    //LOGGING
    console.log(new Date(), ' | ProductService.checkBussinessNumber()');

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
