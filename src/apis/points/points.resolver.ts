import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { IContext } from 'src/common/types/context';
import { PointsService } from './points.service';

@Resolver()
export class PointsResolver {
  constructor(private readonly pointsService: PointsService) {}

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  async requestRefund(
    @Args('amount') amount: number,
    @Context() ctx: IContext,
  ) {
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
}
