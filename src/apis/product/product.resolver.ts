import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateProductInput } from './dto/createProduct.input';
import { UpdateProductInput } from './dto/updateProduct.input';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';

@Resolver()
export class ProductResolver {
  constructor(
    private readonly productService: ProductService, //
  ) {}

  @Query(() => Product, { description: 'fetching single product by productId' })
  fetchProduct(@Args('productId') productId: string) {
    return this.productService.findOne({ productId });
  }
  @Query(() => [Product], { description: 'fetching mutiple product' })
  fetchProducts() {
    return this.productService.findAll();
  }

  @Mutation(() => Product, { description: 'product signup' })
  async createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
  ) {
    await this.productService.checkBussinessNumber({ createProductInput });
    return this.productService.create({
      createProductInput,
    });
  }

  @Mutation(() => Product, { description: 'update product detail' })
  async updateProduct(
    @Args('productId') productId: string,
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
  ) {
    await this.productService.checkSoldout({ productId });
    return this.productService.update({ productId, updateProductInput });
  }
}
