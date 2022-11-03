import { Mutation, Resolver } from '@nestjs/graphql';
import { ProductLikeService } from './productLike.service';

@Resolver()
export class ProductLikeResolver {
  constructor(private readonly productLikeService: ProductLikeService) {}

  @Mutation(() => Boolean)
  async likeProduct() {
    return true;
  }

  @Mutation(() => Boolean)
  async unlikeProduct() {
    return true;
  }

  // TODO: For Future Use
  // Pending Development
  @Mutation(() => Boolean)
  async likeProductComment() {
    return true;
  }

  // TODO: For Future Use
  // Pending Development
  @Mutation(() => Boolean)
  async unlikeProductComment() {
    return true;
  }
}
