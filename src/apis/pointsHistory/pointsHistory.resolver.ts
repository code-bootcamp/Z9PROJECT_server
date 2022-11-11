import { PointsHistoryService } from './pointsHistory.service';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  POINT_HISTORY_TYPE,
  PAYMENT_STATUS_ENUM,
  PointHistory,
} from './entities/pointHistory.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { IContext } from 'src/common/types/context';
import { IamportService } from '../iamport/iamport.service';
import { PointHistoryOutput } from './dto/pointHistory.output';

@Resolver()
export class PointsHistoryResolver {
  constructor(
    private readonly pointsService: PointsHistoryService,
    private readonly iamportService: IamportService,
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [PointHistoryOutput], {
    description:
      '로그인 유저 포인트 내역 가져오기, startDate:"2022-10-10", endDate:"2022-11-12"  ',
    name: 'fetchPointsHistory',
  })
  async fetchPointsHistory(
    @Args({ name: 'startDate', nullable: true }) startDate: Date,
    @Args({ name: 'endDate', nullable: true }) endDate: Date,
    @Context() ctx: IContext,
  ) {
    const { user } = ctx.req;
    const result: PointHistoryOutput[] | PointHistory[] =
      await this.pointsService.fetchPointsHistory(user.id, startDate, endDate);
    return result;
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => PointHistoryOutput, {
    description: '포인트 충전하기.  FE에서 아임포트 결제 성공 후 호출 ',
    name: 'chargePoint',
  })
  async chargePoint(
    @Args('impUid') impUid: string,
    @Args({ name: 'amount', type: () => Int }) amount: number,
    @Context() context: IContext,
  ) {
    const user = context?.req?.user;
    // console.log('유저:', user);

    const paymentData = await this.iamportService.validateCreateInput({
      impUid,
      amount,
      user,
    });
    // console.log('결제 데이터: ', paymentData);

    const pointHistory = await this.pointsService.changePoint({
      useType: POINT_HISTORY_TYPE.CHARGE,
      amount,
      user,
      impUid,
      payStatus: PAYMENT_STATUS_ENUM.PAID,
    });
    console.log('ptHistory rst: ', pointHistory);

    return pointHistory;
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => PointHistoryOutput, { description: '포인트 증/차감 하기' })
  async changePoint(
    @Args({ name: 'amount', type: () => Int }) amount: number,
    @Args('useType') useType: POINT_HISTORY_TYPE,
    @Context() context: IContext,
  ) {
    const user = context.req.user;
    const pointHistory = await this.pointsService.changePoint({
      useType,
      amount,
      user,
    });
    console.log('ptHistory rst: ', pointHistory);

    return pointHistory;
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => PointHistoryOutput, {
    description: '포인트 인출: ex) amount: -200 ',
  })
  async withdrawPoint(
    @Args({ name: 'amount', type: () => Int }) amount: number,
    @Args('impUid') impUid: string,
    @Context() context: IContext,
  ) {
    const user = context.req.user;

    amount = amount > 0 ? -amount : amount;
    const rst = await this.pointsService.changePoint({
      useType: POINT_HISTORY_TYPE.WITHDRAW,
      amount,
      user,
    });
    return rst;
  }

  // @UseGuards(GqlAuthAccessGuard)
  // @Mutation(() => PointHistoryOutput, {
  //   description:
  //     '아임포트에서 포인트 결제 취소(불필요시 삭제): ex) amount: -200 ',
  // })
  /** 필요한 api라면 iamport 검증과 serivice에서 트랜잭션 구성 해주기 */
  async cancelPoint(
    @Args('impUid') impUid: string,
    @Args({ name: 'amount', type: () => Int, nullable: true }) amount: number,
    @Context() context: IContext,
  ) {
    const user = context.req.user;

    const payments = await this.iamportService.validateCancelInput({
      impUid,
      amount,
      user,
    });

    const payment = await this.pointsService.changePoint({
      useType: POINT_HISTORY_TYPE.CHARGE,
      amount: -amount,
      user,
      impUid,
      payStatus: PAYMENT_STATUS_ENUM.CANCELLED,
    });

    return payment;
  }
}
