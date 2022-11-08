import { Field, InputType, Int } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { SNS_TYPE_ENUM, USER_TYPE_ENUM } from '../entities/user.entity';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  nickname: string;

  @Field(() => String)
  phoneNumber: string;

  @Field(() => String, { nullable: true })
  zipcode?: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  addressDetail?: string;

  /** YouTube ChannelName or Instagram Name */
  @Field(() => String, { nullable: true })
  snsName?: string;

  @Field(() => SNS_TYPE_ENUM)
  snsChannel?: SNS_TYPE_ENUM;

  @Field(() => Boolean, { defaultValue: false })
  isAuthedCreator?: boolean;

  @Field(() => Int, { defaultValue: 0, nullable: true })
  followerNumber?: number;

  @Field(() => GraphQLUpload, { nullable: true })
  userProfileImg?: FileUpload;

  @Field(() => GraphQLUpload, { nullable: true })
  creatorAuthImg?: FileUpload;

  @Field(() => String, { nullable: true })
  mainContents?: string;

  @Field(() => String, { nullable: true })
  introduce?: string;

  @Field(() => String, { nullable: true })
  bank?: string;

  @Field(() => String, { nullable: true })
  account?: string;

  @Field(() => String, { nullable: true })
  accountName?: string;

  @Field(() => Int, { nullable: true })
  point?: number;

  @Field(() => USER_TYPE_ENUM, { defaultValue: USER_TYPE_ENUM.COMMON_USER })
  userType: USER_TYPE_ENUM;
}
