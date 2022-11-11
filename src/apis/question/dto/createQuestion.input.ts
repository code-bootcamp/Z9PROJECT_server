import { Field, InputType } from '@nestjs/graphql';

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
}
