import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SmsPostReturn {
  @Field(() => Int)
  smsAuthTime: number;

  @Field(() => String)
  message: string;
}
