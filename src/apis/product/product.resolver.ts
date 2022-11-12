import { UseGuards } from '@nestjs/common';
import {
  Args,
  CONTEXT,
  Context,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { IContext } from 'src/common/types/context';
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
    //LOGGING
    console.log('API Fetch Product Requested');

    return this.productService.findOne({ productId });
  }

  @Query(() => [Product], { description: 'fetching multiple product' })
  fetchProducts() {
    //LOGGING
    console.log('API Fetch Products Requested');

    return this.productService.findAll();
  }

  @Query(() => [Product], {
    description: 'fetching multiple product by creator nickname',
  })
  fetchProductsByCreator(@Args('nickname') nickname: string) {
    //LOGGING
    console.log('API Fetch Products By Creator Requested');

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
    //LOGGING
    console.log('API Fetch Products By Status Requested');
    console.log('type: ', type);
    console.log('option: ', option);

    return this.productService.findProductByStatus({ type, option });
  }

  @Query(() => Number, { description: 'count product by userId' })
  countProductByUserId(@Args('userId') userId: string) {
    //LOGGING
    console.log('API Count Product By UserId Requested');

    return this.productService.countProductByUserId({ userId });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Product, { description: 'product signup' })
  async createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
    @Args('createProductDetailInput')
    createProductDetailInput: CreateProductDetailInput,
    @Context() ctx: IContext,
  ) {
    //LOGGING
    console.log('API Create Product Requested');

    await this.productService.checkBussinessNumber({ createProductInput });
    return this.productService.create({
      userId: ctx.req.user.id,
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
    //LOGGING
    console.log('API Update Product Requested');

    await this.productService.checkSoldout({ productId });
    return this.productService.update({
      productId,
      updateProductInput,
      updateProductDetailInput,
    });
  }

  @Mutation(() => Boolean, { description: 'delete product' })
  async deleteProduct(@Args('productId') productId: string) {
    //LOGGING
    console.log('API Delete Product Requested');

    return this.productService.delete({ productId });
  }
}
