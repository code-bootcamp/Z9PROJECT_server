import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductLikeInput } from 'src/common/types/productLike.types';
import { Repository } from 'typeorm';
import { ProductLike } from './entities/productLike.entity';

@Injectable()
export class ProductLikeService {
  constructor(
    @InjectRepository(ProductLike)
    private readonly productLikeRepository: Repository<ProductLike>,
  ) {}

  async likeProduct({ productId, userId }) {
    // TODO: find if there is a record with productId and userId
    const productLike = await this.productLikeRepository.findOne({
      where: { product: productId, user: userId },
    });
    // TODO: if there is a record, check if it is deleted
    // TODO: if it is deleted, update the record and set deletedAt to null
    // TODO: if there is not a record, create a new record
    if (productLike) {
      if (productLike.deletedAt) {
        productLike.deletedAt = null;
        await this.productLikeRepository.save(productLike);
        return true;
      } else {
        return new ConflictException("You've already liked this product");
      }
    } else {
      await this.productLikeRepository.save({
        product: productId,
        userId: userId,
      });
      return true;
    }
  }
}
