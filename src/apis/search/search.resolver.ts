import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CREATOR_IDX, PRODUCT_IDX, SearchService } from './search.service';
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
    @Args({
      name: 'word',
      type: () => String,
      nullable: true,
      defaultValue: '',
    })
    word: string,
  ) {
    //LOGGING
    console.log('검색 Creator api: ');

    const cacheRst = await this.searchService.getCache(word, CREATOR_IDX);
    if (cacheRst) {
      return cacheRst;
    }

    const creatorSearchRst: SearchCreatorOutput[] =
      await this.searchService.searchCreators(word);

    if (creatorSearchRst) {
      await this.searchService.setCache(word, creatorSearchRst, CREATOR_IDX);
    }

    return creatorSearchRst;
  }

  @Query(() => [SearchProductOutput], {
    nullable: true,
    description:
      'searching products In Product List Page by product name or creator nickname',
  })
  async searchProducts(
    @Args({
      name: 'word',
      type: () => String,
      nullable: true,
      defaultValue: '',
    })
    word: string,
  ) {
    //LOGGING
    console.log('검색 Product api: ');

    const cacheRst = await this.searchService.getCache(word, PRODUCT_IDX);
    if (cacheRst) {
      return cacheRst;
    }

    const productSearchRst: SearchProductOutput[] =
      await this.searchService.searchProducts(word);

    if (productSearchRst) {
      await this.searchService.setCache(word, productSearchRst, PRODUCT_IDX);
    }

    return productSearchRst;
  }
}
