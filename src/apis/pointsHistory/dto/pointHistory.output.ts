import { Field, ObjectType, PartialType } from '@nestjs/graphql';
import { PointHistory } from '../entities/pointHistory.entity';

@ObjectType()
export class PointHistoryOutput extends PartialType(PointHistory) {
  // @Field(() => Number, { nullable: true })
  // userCurPt: number;
}
