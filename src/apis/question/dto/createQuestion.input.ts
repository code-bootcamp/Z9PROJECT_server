import { Field, InputType } from '@nestjs/graphql';
import { QUESTION_STATUS_TYPE_ENUM } from '../question.resolver';

@InputType()
export class CreateQuestionInput {
  @Field(() => String, {
    nullable: true,
    description: '',
  })
  question: string;

  @Field(() => Boolean, {
    description: 'When question is removed by admin, isDeleted convert to ture',
    defaultValue: false,
  })
  isDeleted: boolean;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  productId: string;

  @Field(() => QUESTION_STATUS_TYPE_ENUM, {
    nullable: true,
    defaultValue: QUESTION_STATUS_TYPE_ENUM.PROGRESS,
  })
  status: QUESTION_STATUS_TYPE_ENUM;
}
