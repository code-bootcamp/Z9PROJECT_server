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
    return await this.imageService.uploadOne({ data: image });
  }

  @Mutation(() => [Image])
  async uploadImages(
    @Args({ name: 'images', type: () => [GraphQLUpload] }) images: FileUpload[],
  ) {
    return await this.imageService.uploadMany({ data: images });
  }
}
