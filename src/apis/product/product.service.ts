import { UsersService } from './../users/users.service';
import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import axios from 'axios';
import { ProductDetailService } from '../productDetail/productDetail.service';
import { ProductDetail } from '../productDetail/entities/productDetail.entity';
import { registerEnumType } from '@nestjs/graphql';
import { Order } from '../orders/entities/order.entity';

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
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async findOne({ productId }) {
    //LOGGING
    console.log(new Date(), ' | ProductService.findOne()');

    const result = await this.productRepository
      .createQueryBuilder('product')
      .where('product.id = :productId', { productId })
      .leftJoinAndSelect('product.productDetail', 'productDetail')
      .leftJoinAndSelect('product.user', 'user')
      .getOne();
    return result;
  }

  async findProductsByUserId({ userId }) {
    //LOGGING
    console.log(new Date(), ' | ProductService.findProductsByUserId()');

    return await this.productRepository
      .createQueryBuilder('product')
      .where('product.user = :userId', { userId })
      .leftJoinAndSelect('product.productDetail', 'productDetail')
      .getMany();
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

  async findProductByCreator({ userId, page }) {
    //LOGGING
    console.log(new Date(), ' | ProductService.findProductByCreator()');

    return await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.user', 'user')
      .leftJoinAndSelect('product.productDetail', 'productDetail')
      .where('user.id = :userId', { userId })
      .orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * 10)
      .take(10)
      .getMany();
  }

  async findProgressProducts(userId: string) {
    //LOGGING
    console.log(new Date(), ' | ProductService.findProgressProducts()');

    // 크리에이터가 판매중이고, 매진이 안된 상품 쿼리
    return await this.productRepository
      .createQueryBuilder('product')
      .innerJoinAndSelect('product.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('product.validFrom <= :now', { now: new Date() })
      .andWhere('product.validUntil >= :now', { now: new Date() })
      .andWhere('product.isSoldout = :isSoldout', { isSoldout: false })
      .getMany();
  }

  async countProductByCreator({ userId }) {
    //LOGGING
    console.log(new Date(), ' | ProductService.countProductByCreator()');

    return await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.user', 'user')
      .leftJoinAndSelect('product.productDetail', 'productDetail')
      .where('user.id = :userId', { userId })
      .getCount();
  }

  async findAll() {
    //LOGGING
    console.log(new Date(), ' | ProductService.findAll()');

    return await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productDetail', 'productDetail')
      .leftJoinAndSelect('product.user', 'user')
      .orderBy('product.createdAt', 'DESC')
      .getMany();
  }

  async findProductsByPages({ page }) {
    //LOGGING
    console.log(new Date(), ' | ProductService.findProductsByPages()');

    return await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productDetail', 'productDetail')
      .leftJoinAndSelect('product.user', 'user')
      .orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * 4)
      .take(4)
      .getMany();
  }

  async create({ userId, createProductInput, createProductDetailInput }) {
    //LOGGING
    console.log(new Date(), ' | ProductService.create()');

    const calcDiscountRate: number =
      createProductInput.discountPrice !== null
        ? Math.floor(
            ((createProductInput.originPrice -
              createProductInput.discountPrice) /
              createProductInput.originPrice) *
              100,
          )
        : 0;
    if (
      calcDiscountRate >= 100 ||
      calcDiscountRate < 0 ||
      createProductInput.discountPrice < 0
    ) {
      throw new UnprocessableEntityException(
        '100프로를 초과하거나 0프로 미만인 할인율을 책정할 수 없습니다',
      );
    }
    if (
      createProductInput.originPrice <= 0 ||
      createProductInput.discountPrice <= 0
    ) {
      throw new UnprocessableEntityException(
        '원가보다 낮은 할인가를 입력할 수 없습니다',
      );
    }

    const user = await this.usersService.findOneByUserId(userId);
    const { discountRate, images, originalQuantity, ...product } =
      createProductInput;
    const savedProduct: Product = await this.productRepository.save({
      ...product,
      quantity: originalQuantity,
      originalQuantity,
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
    const { discountRate, images, originalQuantity, ...product } =
      updateProductInput;

    if (originProduct.quantity < originalQuantity) {
      throw new UnprocessableEntityException(
        '남은 수량 이하로 재고를 변경할 수 없습니다',
      );
    }

    const newProduct: Product = await this.productRepository.save({
      ...originProduct,
      images,
      discountRate: calcDiscountRate,
      originalQuantity,
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

  async delete({ productId, userId }) {
    //LOGGING
    console.log(new Date(), ' | ProductService.delete()');

    const user = await this.usersService.findOneByUserId(userId);

    const isOrderExist = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.product', 'product')
      .where('product.id = :productId', { productId })
      .getOne();
    
    const product = await this.productRepository
    .createQueryBuilder('product')
    .leftJoinAndSelect('product.productDetail', 'productDetail')
    .leftJoinAndSelect('product.user', 'user')
    .where('product.id = :productId', { productId })
    .getOne();

    if (product.user.id !== user.id) {
      throw new UnauthorizedException('상품을 삭제할 권한이 없습니다');
    }

    if (isOrderExist) {

    if (isOrderExist) {
      throw new UnprocessableEntityException(
        '주문이 존재하는 상품은 삭제할 수 없습니다',
      );
    }
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
