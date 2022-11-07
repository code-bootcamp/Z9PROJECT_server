import { Field, InputType, Int } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { SNS_TYPE_ENUM, USER_TYPE_ENUM } from '../entities/user.entity';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  loginPassword: string;

  @Field(() => String)
  nickName: string;

  @Field(() => String)
  phoneNumber: string;

  @Field(() => String)
  address?: string;

  @Field(() => String)
  addressDetail?: string;

  /** YouTube ChannelName or Instagram Name */
  @Field(() => String, { nullable: true })
  instaNameOrYTubeChannel?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => SNS_TYPE_ENUM)
  snsType?: SNS_TYPE_ENUM;

  @Field(() => Boolean, { defaultValue: false })
  isAuthedInfluencer?: boolean;

  @Field(() => Int, { defaultValue: 0, nullable: true })
  followerNumber?: number;

  @Field(() => GraphQLUpload, { nullable: true })
  userProfileImg?: FileUpload;

  @Field(() => GraphQLUpload, { nullable: true })
  influencerAuthImg?: FileUpload;

  @Field(() => String, { nullable: true })
  mainContentName?: string;

  @Field(() => String, { nullable: true })
  aboutInfluencer?: string;

  @Field(() => String, { nullable: true })
  bankName?: string;

  @Field(() => String, { nullable: true })
  bankAccountNumber?: string;

  @Field(() => String, { nullable: true })
  accountOwnerName?: string;

  @Field(() => Int, { nullable: true })
  point?: number;

  @Field(() => USER_TYPE_ENUM, { defaultValue: USER_TYPE_ENUM.COMMON_USER })
  userType: USER_TYPE_ENUM;
}
