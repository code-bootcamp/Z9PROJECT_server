import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductViewService } from './productView.service';

@Resolver()
export class ProductViewResolver {
  constructor(private readonly productViewService: ProductViewService) {}

  @Query(() => Int)
  async fetchProductViewCount(@Args('productId') productId: string) {
    return await this.productViewService.getViews({ productId });
  }

  @Mutation(() => Int)
  async addProductViewCount(@Args('productId') productId: string) {
    return await this.productViewService.addView({ productId });
  }
}
