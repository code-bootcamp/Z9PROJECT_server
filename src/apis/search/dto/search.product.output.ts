import { Field, ObjectType, OmitType } from '@nestjs/graphql';
import { Product } from 'src/apis/product/entities/product.entity';

@ObjectType()
export class SearchProductOutput extends OmitType(
  Product,
  [
    'productDetail',
    'content',
    'validFrom',
    'validUntil',
    'updatedAt',
    'deletedAt',
    'createdAt',
  ],
  ObjectType,
) {
  @Field(() => String, { nullable: true })
  validFrom: string;

  @Field(() => String, { nullable: true })
  validUntil: string;

  @Field(() => String, { nullable: true })
  createdAt: string;

  @Field(() => String, { nullable: true })
  deletedAt: string;
}
