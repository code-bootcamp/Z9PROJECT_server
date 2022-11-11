import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { IContext } from 'src/common/types/context';
import { Product } from '../product/entities/product.entity';
import { ProductLike } from './entities/productLike.entity';
import { ProductLikeService } from './productLike.service';

@Resolver()
export class ProductLikeResolver {
  constructor(private readonly productLikeService: ProductLikeService) {}

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  async likeProduct(
    @Args('productId') productId: string,
    @Context() ctx: IContext,
  ) {
    return this.productLikeService.likeProduct({
      productId,
      userId: ctx.req.user.id,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Product])
  async fetchAllLikes(@Context() ctx: IContext) {
    return this.productLikeService.findAllLikes({ userId: ctx.req.user.id });
  }

  @Query(() => Int)
  async fetchLikeCount(@Args('productId') productId: string) {
    return this.productLikeService.countLikes({ productId });
  }

  // TODO: For Future Use
  // Pending Development
  // @Mutation(() => Boolean)
  // async likeProductComment() {
  //   return true;
  // }

  // TODO: For Future Use
  // Pending Development
  // @Mutation(() => Boolean)
  // async unlikeProductComment() {
  //   return true;
  // }
}
