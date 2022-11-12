import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { IContext } from 'src/common/types/context';
import { Point } from './entities/point.entity';
import { PointsService } from './points.service';

@Resolver()
export class PointsResolver {
  constructor(private readonly pointsService: PointsService) {}

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  async requestPointRefund(
    @Args('amount') amount: number,
    @Context() ctx: IContext,
  ) {
    //LOGGING
    console.log('API Request Point Refund Requested');

    const point = await this.pointsService.refundPoint({
      amount,
      userId: ctx.req.user.id,
    });
    if (point) {
      return true;
    } else {
      return false;
    }
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => [Point])
  async fetchPointHistory(@Context() ctx: IContext) {
    //LOGGING
    console.log('API Fetch Point History Requested');

    return await this.pointsService.findAllHistoryByUserId({
      userId: ctx.req.user.id,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Number)
  async fetchMyPoint(@Context() ctx: IContext) {
    //LOGGING
    console.log('API Fetch My Point Requested');

    return await this.pointsService.getPoint({ userId: ctx.req.user.id });
  }
}
