import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
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
    console.log(new Date(), ' | API Request Point Refund Requested');

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
  @Query(() => [Point])
  async fetchPointHistory(
    @Context() ctx: IContext,
    @Args({ name: 'startDate', nullable: true, defaultValue: null })
    startDate: Date,
    @Args({ name: 'endDate', nullable: true, defaultValue: null })
    endDate: Date,
    @Args({ name: 'page', type: () => Int }) page: number,
  ) {
    //LOGGING
    console.log(new Date(), ' | API Fetch Point History Requested');

    return await this.pointsService.findAllHistoryByUserId({
      userId: ctx.req.user.id,
      startDate,
      endDate,
      page,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => Number)
  async fetchCountOfPointHistory(
    @Context() ctx: IContext,
    @Args({ name: 'startDate', nullable: true, defaultValue: null })
    startDate: Date,
    @Args({ name: 'endDate', nullable: true, defaultValue: null })
    endDate: Date,
  ) {
    //LOGGING
    console.log(new Date(), ' | API Fetch Count Of Point History Requested');

    return await this.pointsService.countPointHistoryByUserId({
      userId: ctx.req.user.id,
      startDate,
      endDate,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => Number)
  async fetchMyPoint(@Context() ctx: IContext) {
    //LOGGING
    console.log(new Date(), ' | API Fetch My Point Requested');

    return await this.pointsService.getPoint({ userId: ctx.req.user.id });
  }
}
