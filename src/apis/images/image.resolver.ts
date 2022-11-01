import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { ImageUploadData } from 'src/common/types/image.types';
import { User } from '../users/entities/user.entity';
import { ImageService } from './image.service';

@Resolver()
export class ImageResolver {
  constructor(private readonly imageService: ImageService) {}

  // TODO: This Mutation will need authguard
  @Mutation(() => Image)
  async uploadImage(
    @Args({ name: 'image', type: () => GraphQLUpload }) image: FileUpload,
    @Args({ name: 'isMain', type: () => Boolean }) isMain: boolean,
    @Args({ name: 'isContents', type: () => Boolean }) isContents: boolean,
    @Args({ name: 'contentsOrder', type: () => Number, nullable: true })
    contentsOrder: number,
    // TODO: Adding context to get user id
  ) {
    // TODO: find user by userid
    const data: ImageUploadData = {
      image,
      isMain,
      isContents,
      contentsOrder: contentsOrder ? contentsOrder : null,
      // 임시로 null 처리 (테스트용)
      user: null,
    };
    return await this.imageService.uploadOne({ data });
  }

  @Mutation(() => [Image])
  async uploadImages(
    @Args({ name: 'images', type: () => [GraphQLUpload] }) images: FileUpload[],
    @Args({ name: 'isMain', type: () => [Boolean] }) isMain: boolean[],
    @Args({ name: 'isContents', type: () => [Boolean] }) isContents: boolean[],
    @Args({ name: 'contentsOrder', type: () => [Number], nullable: true })
    contentsOrder: [number],
    // TODO: Adding context to get user id
  ) {
    const data: ImageUploadData[] = images.map((image, index) => {
      return {
        image,
        isMain: isMain[index],
        isContents: isContents[index],
        contentsOrder: contentsOrder ? contentsOrder[index] : null,
        // 임시로 null 처리 (테스트용)
        user: null,
      };
    });
    return await this.imageService.uploadMany({ data });
  }
}
