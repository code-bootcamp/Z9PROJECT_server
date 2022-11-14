import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { IContext } from 'src/common/types/context';
import { PointsService } from '../points/points.service';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

@Resolver()
export class OrdersResolver {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly pointsService: PointsService,
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Order])
  async fetchOrdersByUserId(@Context() ctx: IContext) {
    //LOGGING
    console.log(new Date(), ' | API Fetch Orders By User Id Requested');

    return await this.ordersService.findAllByUserId({
      userId: ctx.req.user.id,
    });
  }

  @Query(() => Order)
  async fetchOrder(@Args('orderId') orderId: string) {
    //LOGGING
    console.log(new Date(), ' | API Fetch Order Requested');

    return await this.ordersService.findOneByOrderId({ orderId });
  }

  @Query(() => [Order])
  async fetchOrdersByProductId(@Args('productId') productId: string) {
    //LOGGING
    console.log(new Date(), ' | API Fetch Orders By Product Id Requested');

    return await this.ordersService.findAllByProductId({ productId });
  }

  @Query(() => [Order])
  async fetchOrdersByCreatorId(@Context() ctx: IContext) {
    //LOGGING
    console.log(new Date(), ' | API Fetch Orders By Creator Id Requested');

    return await this.ordersService.findAllByCreatorId({
      userId: ctx.req.user.id,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Order)
  async createOrder(
    @Args('productId') productId: string,
    @Args('price') price: number,
    @Args('quantity') quantity: number,
    @Context() ctx: IContext,
  ) {
    //LOGGING
    console.log(new Date(), ' | API Create Order Requested');

    const order = await this.ordersService.createOrder({
      userId: ctx.req.user.id,
      productId,
      price,
      quantity,
    });
    await this.pointsService.updateUserPoint({
      userId: ctx.req.user.id,
    });
    return order;
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Order)
  async cancelOrderRequest(
    @Args('orderId') orderId: string,
    @Context() ctx: IContext,
  ) {
    //LOGGING
    console.log(new Date(), ' | API Cancel Order Requested');

    return await this.ordersService.reqCancelOrder({
      userId: ctx.req.user.id,
      orderId,
    });
  }

  @Mutation(() => Order)
  async cancelOrderAccept(@Args('orderId') orderId: string) {
    //LOGGING
    console.log(new Date(), ' | API Cancel Order Accepted');

    const order = await this.ordersService.acceptCancelOrder({ orderId });
    await this.pointsService.updateUserPoint({
      userId: order.user.id,
    });
    return order;
  }
}
