import { Field, InputType } from '@nestjs/graphql';
import { Min } from 'class-validator';
import { PRODUCT_END_TYPE } from '../entities/product.entity';

@InputType()
export class CreateProductInput {
  @Field(() => String, { nullable: false })
  name: string;

  @Min(0)
  @Field(() => Number, { nullable: false })
  originPrice: number;

  @Field(() => Number, { nullable: false })
  quantity: number;

  @Min(0)
  @Field(() => Number, { nullable: true })
  discountPrice: number;

  @Field(() => String, { nullable: false, defaultValue: '택배(무료배송)' })
  delivery: string;

  @Field(() => String, { nullable: true })
  option1: string;

  @Field(() => String, { nullable: true })
  option2: string;

  @Field(() => String, { nullable: true })
  option3: string;

  @Field(() => String, { nullable: true })
  option4: string;

  @Field(() => String, { nullable: true })
  option5: string;

  @Field(() => PRODUCT_END_TYPE, { nullable: false })
  endType: string;

  @Field(() => String, { nullable: true })
  youtubeLink: string;

  @Field(() => Date, { nullable: false })
  validFrom: Date;

  @Field(() => Date, { nullable: false })
  validUntil: Date;

  @Field(() => [String], { nullable: true })
  images: string[];

  @Field(() => [String], { nullable: true })
  detailImages: string[];

  @Field(() => String, { nullable: true })
  content: string;

  @Field(() => String, { nullable: false })
  shopName: string;

  @Field(() => String, { nullable: false })
  ceo: string;

  @Field(() => String, {
    nullable: false,
    description: 'brn is business_registration_number',
  })
  brn: string;

  @Field(() => String, {
    nullable: false,
    description: 'mobn is mail_order_business_number',
  })
  mobn: string;

  @Field(() => Number, {
    nullable: false,
    description: 'skin is seleted by user',
  })
  skin: number;
  @Field(() => String, {
    nullable: true,
    description: 'color is seleted by user',
  })
  color: string;

  @Field(() => String)
  userid: string;
}
