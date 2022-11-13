import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateAnswerInput {
  @Field(() => String, {
    nullable: true,
    description: '',
  })
  answer: string;

  @Field(() => Boolean, {
    description: 'When answer is removed by admin, isDeleted convert to true',
    defaultValue: false,
  })
  isDeleted: boolean;

  // @Field(() => String)
  // userId: string;
}
