import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ES_IDX_TYPE, SearchService } from './search.service';
import { SearchProductOutput } from './dto/search.product.output';
import { SearchCreatorOutput } from './dto/search.creator.output';

@Resolver()
export class SearchResolver {
  constructor(private readonly searchService: SearchService) {}

  @Query(() => [SearchCreatorOutput], {
    nullable: true,
    description:
      'searching creators In Creator Page by nickname or UtubeChannelName/InstaName',
  })
  async searchCreators(
    @Args({ name: 'word', type: () => String, nullable: true }) word: string,
    @Args({ name: 'page', type: () => Int, nullable: true }) page: number,
    @Args({ name: 'size', type: () => Int, nullable: true }) size: number,
  ) {
    //LOGGING
    console.log('검색 Creator api: ');

    const cacheRst = await this.searchService.getCache(
      word,
      ES_IDX_TYPE.CREATOR_IDX,
    );
    if (cacheRst) {
      return cacheRst;
    }

    const creatorSearchRst: SearchCreatorOutput[] =
      await this.searchService.searchCreators(word, page, size);

    if (creatorSearchRst) {
      await this.searchService.setCache(
        word,
        creatorSearchRst,
        ES_IDX_TYPE.CREATOR_IDX,
      );
    }

    return creatorSearchRst;
  }

  @Query(() => [SearchProductOutput], {
    nullable: true,
    description:
      'searching products In Product List Page by product name or creator snsName',
  })
  async searchProducts(
    @Args({ name: 'word', type: () => String, nullable: true }) word: string,
    @Args({ name: 'page', type: () => Int, nullable: true }) page: number,
    @Args({ name: 'size', type: () => Int, nullable: true }) size: number,
  ) {
    //LOGGING
    console.log('검색 Product api: ');

    const cacheRst = await this.searchService.getCache(
      word,
      ES_IDX_TYPE.PRODUCT_IDX,
    );
    if (cacheRst) {
      return cacheRst;
    }

    const productSearchRst: SearchProductOutput[] =
      await this.searchService.searchProducts(word, page, size);

    if (productSearchRst) {
      await this.searchService.setCache(
        word,
        productSearchRst,
        ES_IDX_TYPE.PRODUCT_IDX,
      );
    }

    return productSearchRst;
  }
}
