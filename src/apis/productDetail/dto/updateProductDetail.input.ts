import { InputType, PartialType } from '@nestjs/graphql';
import { CreateProductDetailInput } from './createProductDetail.input';

@InputType()
export class UpdateProductDetailInput extends PartialType(
  CreateProductDetailInput,
) {}
