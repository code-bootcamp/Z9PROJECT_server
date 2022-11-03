import { Mutation, Resolver } from '@nestjs/graphql';
import { ProductService } from './product.service';

@Resolver()
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}
  @Mutation(() => Boolean)
  async createProduct() {
    return true;
  }
}
