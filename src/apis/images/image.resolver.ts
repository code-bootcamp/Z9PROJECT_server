import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ImageService } from './image.service';
import { Image } from './entities/image.entity';
import { UploadImageInput } from './dto/uploadImage.input';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Resolver()
export class ImageResolver {
  constructor(
    private readonly imageService: ImageService,
    private readonly usersService: UsersService,
  ) {}

  @Mutation(() => Image)
  async uploadImage(
    @Args('uploadImageInput') uploadImageInput: UploadImageInput,
  ) {
    const data: UploadImageInput = {
      ...uploadImageInput,
    };
    const user: User = await this.usersService.findOneByUserId(
      uploadImageInput.userId,
    );
    return await this.imageService.uploadOne({ data, user });
  }

  @Mutation(() => [Image])
  async uploadImages(
    @Args('uploadImagesInput') uploadImagesInput: UploadImageInput[],
  ) {
    const data: UploadImageInput[] = uploadImagesInput.map((image) => {
      return {
        ...image,
      };
    });
    const user: User[] = await Promise.all(
      uploadImagesInput.map(async (image) => {
        return await this.usersService.findOneByUserId(image.userId);
      }),
    );
    return await this.imageService.uploadMany({ data, user });
  }
}
