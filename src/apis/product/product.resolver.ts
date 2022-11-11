import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateProductDetailInput } from '../productDetail/dto/createProductDetail.input';
import { CreateProductInput } from './dto/createProduct.input';
import { UpdateProductInput } from './dto/updateProduct.input';
import { Product } from './entities/product.entity';
import {
  ProductService,
  PRODUCT_INCLUDE_OPTION,
  PRODUCT_SEARCH_TYPE,
} from './product.service';

@Resolver()
export class ProductResolver {
  constructor(
    private readonly productService: ProductService, //
  ) {}

  @Query(() => Product, { description: 'fetching single product by productId' })
  fetchProduct(@Args('productId') productId: string) {
    return this.productService.findOne({ productId });
  }

  @Query(() => [Product], { description: 'fetching multiple product' })
  fetchProducts() {
    return this.productService.findAll();
  }

  @Query(() => [Product], {
    description: 'fetching multiple product by creator nickname',
  })
  fetchProductsByCreator(@Args('nickname') nickname: string) {
    return this.productService.findProductByCreator({ name: nickname });
  }

  @Query(() => [Product], {
    description: 'fetching multiple product by status',
  })
  fetchProductsByStatus(
    @Args({ name: 'type', type: () => PRODUCT_SEARCH_TYPE })
    type: PRODUCT_SEARCH_TYPE,
    @Args({ name: 'option', type: () => PRODUCT_INCLUDE_OPTION })
    option: PRODUCT_INCLUDE_OPTION,
  ) {
    return this.productService.findProductByStatus({ type, option });
  }

  @Query(() => Number, { description: 'count product by userId' })
  countProductByUserId(@Args('userId') userId: string) {
    return this.productService.countProductByUserId({ userId });
  }

  @Mutation(() => Product, { description: 'product signup' })
  async createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
    @Args('createProductDetailInput')
    createProductDetailInput: CreateProductDetailInput,
  ) {
    await this.productService.checkBussinessNumber({ createProductInput });
    return this.productService.create({
      createProductInput,
      createProductDetailInput,
    });
  }

  @Mutation(() => Product, { description: 'update product detail' })
  async updateProduct(
    @Args('productId') productId: string,
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
    @Args('updateProductDetailInput')
    updateProductDetailInput: UpdateProductInput,
  ) {
    await this.productService.checkSoldout({ productId });
    return this.productService.update({
      productId,
      updateProductInput,
      updateProductDetailInput,
    });
  }

  @Mutation(() => Boolean, { description: 'delete product' })
  async deleteProduct(@Args('productId') productId: string) {
    return this.productService.delete({ productId });
  }
}
