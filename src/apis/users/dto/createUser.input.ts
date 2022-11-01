import { Field, InputType } from '@nestjs/graphql';
import { SNS_TYPE_ENUN, USER_TYPE_ENUM } from '../entities/user.entity';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  loginId: string;

  @Field(() => String)
  loginPassword: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  phone: string;

  @Field(() => String, { nullable: true })
  address: string;

  @Field(() => String, { nullable: true })
  addressDetail: string;

  @Field(() => String, { nullable: true })
  snsLink: string;

  @Field(() => SNS_TYPE_ENUN, { nullable: true })
  snsType: SNS_TYPE_ENUN;

  // 추후 다른 api나 dto로 따로 빼는거 고려
  @Field(() => Boolean, { nullable: true })
  isValidCreator: boolean;

  @Field(() => USER_TYPE_ENUM, { nullable: true })
  userType: USER_TYPE_ENUM;
}
