import { Field, InputType } from '@nestjs/graphql';
import { PRODUCT_END_TYPE } from '../entities/product.entity';

@InputType()
export class CreateProductInput {
  @Field(() => String, { nullable: false })
  name: string;

  @Field(() => Number, { nullable: false })
  originPrice: number;

  @Field(() => Number, { nullable: true })
  discountRate: number;

  @Field(() => String, { nullable: true })
  delivery: string;

  @Field(() => PRODUCT_END_TYPE, { nullable: false })
  endType: string;

  @Field(() => Date, { nullable: false })
  validFrom: Date;

  @Field(() => Date, { nullable: false })
  validUntil: Date;

  @Field(() => String, { nullable: true })
  content: string;
}
