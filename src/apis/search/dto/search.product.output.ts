import { Field, ObjectType, OmitType } from '@nestjs/graphql';
import { Product } from 'src/apis/product/entities/product.entity';

@ObjectType()
export class SearchProductOutput extends OmitType(
  Product,
  [
    'productDetail', //
    'content',
  ],
  ObjectType,
) {}
