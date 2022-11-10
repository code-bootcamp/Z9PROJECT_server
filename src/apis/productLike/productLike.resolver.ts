import { UseGuards } from '@nestjs/common';
import { Args, CONTEXT, Context, Mutation, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { IContext } from 'src/common/types/context';
import { ProductLikeService } from './productLike.service';

@Resolver()
export class ProductLikeResolver {
  constructor(private readonly productLikeService: ProductLikeService) {}

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  async likeProduct(
    @Args('productId') productId: number,
    @Context() ctx: IContext,
  ) {
    return this.productLikeService.likeProduct({
      productId,
      userId: ctx.req.user.id,
    });
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
