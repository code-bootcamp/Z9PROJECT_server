import { Field, InputType, Int } from '@nestjs/graphql';
import { SNS_TYPE_ENUM, USER_TYPE_ENUM } from '../entities/user.entity';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;

  @Field(() => USER_TYPE_ENUM, { defaultValue: USER_TYPE_ENUM.COMMON_USER })
  userType: USER_TYPE_ENUM;

  @Field(() => String)
  nickname: string;

  @Field(() => String)
  phoneNumber: string;

  @Field(() => String)
  zipcode: string;

  @Field(() => String)
  address: string;

  @Field(() => String)
  addressDetail: string;

  @Field(() => String, { nullable: true })
  profileImg: string;

  @Field(() => String, { nullable: true })
  creatorAuthImg: string;

  @Field(() => Boolean, { defaultValue: false })
  isAuthedCreator: boolean;

  @Field(() => String, { nullable: true })
  snsId: string;

  /** YouTube ChannelName or Instagram Name */
  @Field(() => String, { nullable: true })
  snsName: string;

  @Field(() => SNS_TYPE_ENUM)
  snsChannel: SNS_TYPE_ENUM;

  @Field(() => Int, { defaultValue: 0, nullable: true })
  followerNumber: number;

  @Field(() => String, { nullable: true })
  mainContents: string;

  @Field(() => String, { nullable: true })
  introduce: string;

  @Field(() => String, { nullable: true })
  bank: string;

  @Field(() => String, { nullable: true })
  account: string;

  @Field(() => String, { nullable: true })
  accountName: string;

  @Field(() => Int, { defaultValue: 0 })
  point: number;
}
