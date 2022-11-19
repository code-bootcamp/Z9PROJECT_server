import { Field, ObjectType, OmitType } from '@nestjs/graphql';
import { SearchCreatorOutput } from './search.creator.output';
import { SearchProductOutput } from './search.product.output';

@ObjectType()
export class SearchOutput {
  @Field(() => [SearchCreatorOutput], { nullable: true })
  creators: SearchCreatorOutput[];

  @Field(() => [SearchProductOutput], { nullable: true })
  products: SearchProductOutput[];
}
