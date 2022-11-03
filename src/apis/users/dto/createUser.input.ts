import { Field, InputType } from '@nestjs/graphql';
import { SNSTYPE_ENUM, USERTYPE_ENUM } from '../entities/user.entity';

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

  @Field(() => SNSTYPE_ENUM, { nullable: true })
  snsType: SNSTYPE_ENUM;

  // 추후 다른 api나 dto로 따로 빼는거 고려
  @Field(() => Boolean, { nullable: true })
  isValidCreator: boolean;

  @Field(() => USERTYPE_ENUM, { nullable: true })
  userType: USERTYPE_ENUM;
}
