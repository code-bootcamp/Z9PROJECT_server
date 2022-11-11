import { ProductService } from './../product/product.service';
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductLike } from './entities/productLike.entity';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class ProductLikeService {
  constructor(
    @InjectRepository(ProductLike)
    private readonly productLikeRepository: Repository<ProductLike>,
    private readonly productService: ProductService,
  ) {}

  async likeProduct({ productId, userId }) {
    const checkLike = await this.productLikeRepository
      .createQueryBuilder('productLike')
      .where('productLike.productId = :productId', { productId })
      .andWhere('productLike.userId = :userId', { userId })
      .getOne();
    console.log(checkLike);
    if (checkLike) {
      const result = await this.productLikeRepository
        .delete({
          id: checkLike.id,
        })
        .catch(() => {
          throw new UnprocessableEntityException('좋아요 실패');
        });
      console.log(result);
      return false;
    } else {
      const result = await this.productLikeRepository
        .save({
          product: { id: productId },
          user: { id: userId },
        })
        .catch(() => {
          throw new UnprocessableEntityException('좋아요 실패');
        });
      console.log(result);
      return true;
    }
  }

  async isLiked({ productId, userId }): Promise<boolean> {
    const checkLike = await this.productLikeRepository
      .createQueryBuilder('productLike')
      .where('productLike.productId = :productId', { productId })
      .andWhere('productLike.userId = :userId', { userId })
      .getOne();
    if (checkLike) {
      if (checkLike.deletedAt) {
        return false;
      } else {
        return true;
      }
    }
    return false;
  }

  async findAllLikes({ userId }) {
    const productIds = await this.productLikeRepository
      .createQueryBuilder('productLike')
      .select('productLike.productId')
      .where('productLike.userId = :userId', { userId })
      .getMany();

    const products: Product[] = await Promise.all(
      productIds.map(async (productId): Promise<Product> => {
        return await this.productService.findOne({ productId });
      }),
    );

    return products;
  }

  async countLikes({ productId }): Promise<number> {
    const count = await this.productLikeRepository
      .createQueryBuilder('productLike')
      .where('productLike.productId = :productId', { productId })
      .getCount();
    return count;
  }
}
