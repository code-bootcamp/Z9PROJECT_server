import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductLike } from './entities/productLike.entity';

@Injectable()
export class ProductLikeService {
  constructor(
    @InjectRepository(ProductLike)
    private readonly productLikeRepository: Repository<ProductLike>,
  ) {}

  async likeProduct({ productId, userId }) {
    const checkLike = await this.productLikeRepository
      .createQueryBuilder('productLike')
      .where('productLike.productId = :productId', { productId })
      .andWhere('productLike.userId = :userId', { userId })
      .getOne();

    if (checkLike) {
      // 이미 좋아요 상태인지 확인 (deteledAt 값이 null인지 확인)
      if (checkLike.deletedAt) {
        // 좋아요 상태가 아닌 경우 좋아요로 변경
        await this.productLikeRepository
          .update({ id: checkLike.id }, { deletedAt: null })
          .catch(() => {
            throw new UnprocessableEntityException('좋아요 실패');
          });
        return true;
      } else {
        // 좋아요 상태인 경우 좋아요 취소로 변경
        const result = await this.productLikeRepository
          .softDelete({ id: checkLike.id })
          .catch(() => {
            throw new UnprocessableEntityException('좋아요 취소 실패');
          });
        if (result.affected) {
          return false;
        } else {
          throw new NotFoundException('좋아요 취소 실패');
        }
      }
    } else {
      // 새롭게 좋아요를 누른 경우
      await this.productLikeRepository
        .save({
          product: { id: productId },
          user: { id: userId },
        })
        .catch(() => {
          throw new UnprocessableEntityException('좋아요 실패');
        });
      return true;
    }
  }

  async findAllLikes({ userId }) {
    const likes: ProductLike[] = await this.productLikeRepository
      .createQueryBuilder('productLike')
      .where('productLike.userId = :userId', { userId })
      .andWhere('productLike.deletedAt IS NULL')
      .leftJoinAndSelect('productLike.product', 'product')
      .leftJoinAndSelect('product.productDetail', 'productDetail')
      .getMany();
    return likes;
  }

  async countLikes({ productId }): Promise<number> {
    const count = await this.productLikeRepository
      .createQueryBuilder('productLike')
      .where('productLike.productId = :productId', { productId })
      .andWhere('productLike.deletedAt IS NULL')
      .getCount();
    return count;
  }
}
