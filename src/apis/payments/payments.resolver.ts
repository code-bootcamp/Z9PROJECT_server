import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { IContext } from 'src/common/types/context';
import { PointsService } from '../points/points.service';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';

@Resolver()
export class PaymentsResolver {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly pointsService: PointsService,
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Payment)
  async createPayment(
    @Args('impUid') impUid: string,
    @Args('amount') amount: number,
    @Context() ctx: IContext,
  ) {
    //LOGGING
    console.log('API Create Payment Requested');

    const payment = await this.paymentsService.createPayment({
      impUid,
      amount,
      userId: ctx.req.user.id,
    });
    const user = await this.pointsService.updateUserPoint({
      userId: ctx.req.user.id,
    });

    //LOGGING
    console.log('User Point Updated', user.point);

    return payment;
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Payment)
  async refundPayment(
    @Args('impUid') impUid: string,
    @Args('amount') amount: number,
    @Context() ctx: IContext,
  ) {
    //LOGGING
    console.log('API Refund Payment Requested');

    const payment = await this.paymentsService.refundPayment({
      impUid,
      amount,
      userId: ctx.req.user.id,
    });
    const user = await this.pointsService.updateUserPoint({
      userId: ctx.req.user.id,
    });

    //LOGGING
    console.log('User Point Updated', user.point);

    return payment;
  }
}
