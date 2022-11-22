import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { IContext } from 'src/common/types/context';
import { CreateProductDetailInput } from '../productDetail/dto/createProductDetail.input';
import { UpdateProductDetailInput } from '../productDetail/dto/updateProductDetail.input';
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
  async fetchProduct(@Args('productId') productId: string) {
    //LOGGING
    console.log(new Date(), ' | API Fetch Product Requested');

    return await this.productService.findOne({ productId });
  }

  @Query(() => [Product], { description: 'fetching multiple product' })
  async fetchProducts() {
    //LOGGING
    console.log(new Date(), ' | API Fetch Products Requested');

    return await this.productService.findAll();
  }

  @Query(() => [Product], { description: 'fetching multiple product' })
  async fetchProductsByPages(
    @Args({ name: 'page', type: () => Int }) page: number,
  ) {
    //LOGGING
    console.log(new Date(), ' | API Fetch Products By Pages Requested');

    return await this.productService.findProductsByPages({ page });
  }

  @Query(() => [Product], {
    description: 'fetching multiple product by creator id',
  })
  async fetchProductsByCreator(
    @Args('userId') userId: string,
    @Args({ name: 'page', type: () => Int }) page: number,
  ) {
    //LOGGING
    console.log(new Date(), ' | API Fetch Products By Creator Requested');

    return await this.productService.findProductByCreator({
      userId,
      page,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => Number)
  async countProductByCreator(@Context() ctx: IContext) {
    //LOGGING
    console.log(new Date(), ' | API Count Product By Creator Requested');

    return await this.productService.countProductByCreator({
      userId: ctx.req.user.id,
    });
  }

  @Query(() => [Product], {
    description: 'fetching multiple product by status',
  })
  async fetchProductsByStatus(
    @Args({ name: 'type', type: () => PRODUCT_SEARCH_TYPE })
    type: PRODUCT_SEARCH_TYPE,
    @Args({ name: 'option', type: () => PRODUCT_INCLUDE_OPTION })
    option: PRODUCT_INCLUDE_OPTION,
  ) {
    //LOGGING
    console.log(new Date(), ' | API Fetch Products By Status Requested');
    console.log(new Date(), ' | type: ', type);
    console.log(new Date(), ' | option: ', option);

    return await this.productService.findProductByStatus({ type, option });
  }

  @Query(() => Number, { description: 'count product by userId' })
  async countProductByUserId(@Args('userId') userId: string) {
    //LOGGING
    console.log(new Date(), ' | API Count Product By UserId Requested');

    return await this.productService.countProductByUserId({ userId });
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
    console.log(new Date(), ' | API Create Product Requested');

    await this.productService.checkBussinessNumber({ createProductInput });
    return await this.productService.create({
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
    updateProductDetailInput: UpdateProductDetailInput,
  ) {
    //LOGGING
    console.log(new Date(), ' | API Update Product Requested');

    await this.productService.checkSoldout({ productId });
    return await this.productService.update({
      productId,
      updateProductInput,
      updateProductDetailInput,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean, { description: 'delete product' })
  async deleteProduct(
    @Args('productId') productId: string,
    @Context() ctx: IContext,
  ) {
    //LOGGING
    console.log(new Date(), ' | API Delete Product Requested');

    return await this.productService.delete({
      productId,
      userId: ctx.req.user.id,
    });
  }
}
