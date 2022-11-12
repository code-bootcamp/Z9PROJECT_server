import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { IContext } from 'src/common/types/context';
import { Product } from '../product/entities/product.entity';
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
    //LOGGING
    console.log(new Date(), ' | API Like Product Requested');

    return this.productLikeService.likeProduct({
      productId,
      userId: ctx.req.user.id,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Product])
  async fetchAllLikes(@Context() ctx: IContext) {
    //LOGGING
    console.log(new Date(), ' | API Fetch All Likes Requested');

    return this.productLikeService.findAllLikes({ userId: ctx.req.user.id });
  }

  @Query(() => Int)
  async fetchLikeCount(@Args('productId') productId: string) {
    //LOGGING
    console.log(new Date(), ' | API Fetch Like Count Requested');

    return this.productLikeService.countLikes({ productId });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => Boolean)
  async fetchIsLiked(
    @Args('productId') productId: string,
    @Context() ctx: IContext,
  ) {
    //LOGGING
    console.log(new Date(), ' | API Fetch Is Liked Requested');

    return this.productLikeService.isLiked({
      productId,
      userId: ctx.req.user.id,
    });
  }

  // Pending Development
  // @Mutation(() => Boolean)
  // async likeProductComment() {
  //   return true;
  // }

  // Pending Development
  // @Mutation(() => Boolean)
  // async unlikeProductComment() {
  //   return true;
  // }
}
