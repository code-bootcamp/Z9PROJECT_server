import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ImageService } from './image.service';
import { Image } from './entities/image.entity';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

@Resolver()
export class ImageResolver {
  constructor(private readonly imageService: ImageService) {}

  @Mutation(() => Image)
  async uploadImage(
    @Args({ name: 'image', type: () => GraphQLUpload }) image: FileUpload,
  ) {
    //LOGGING
    console.log('API uploadImage requested');

    return await this.imageService.uploadOne({ data: image });
  }

  @Mutation(() => [Image])
  async uploadImages(
    @Args({ name: 'images', type: () => [GraphQLUpload] }) images: FileUpload[],
  ) {
    //LOGGING
    console.log('API uploadImages requested');

    return await this.imageService.uploadMany({ data: images });
  }
}
