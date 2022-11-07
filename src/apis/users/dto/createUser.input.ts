import { Field, InputType, Int } from '@nestjs/graphql';
import { SNS_TYPE_ENUM, USER_TYPE_ENUM } from '../entities/user.entity';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  loginId: string;

  @Field(() => String)
  loginPassword: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  phoneNumber: string;

  @Field(() => String)
  address?: string;

  @Field(() => String)
  addressDetail?: string;

  @Field(() => String)
  snsLink?: string;

  @Field(() => SNS_TYPE_ENUM)
  snsType?: SNS_TYPE_ENUM;

  // 추후 다른 api나 dto로 따로 빼는거 고려
  @Field(() => Boolean, { defaultValue: false })
  isValidCreator?: boolean;

  /** YouTube Id or Instagram Id */
  @Field(() => String, { nullable: true })
  influencerId?: string;

  @Field(() => Int, { defaultValue: 0, nullable: true })
  followerNumber?: number;

  @Field(() => [String], { nullable: true })
  imgUrls?: string[];

  @Field(() => USER_TYPE_ENUM, { defaultValue: USER_TYPE_ENUM.COMMON_USER })
  userType: USER_TYPE_ENUM;
}
