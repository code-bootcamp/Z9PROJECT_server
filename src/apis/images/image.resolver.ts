import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ImageService } from './image.service';
import { Image } from './entities/image.entity';
import { UploadImageInput } from './dto/uploadImage.input';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { UploadImagesInput } from './dto/uploadImages.input';

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
    @Args('uploadImagesInput') uploadImagesInput: UploadImagesInput,
  ) {
    const data = uploadImagesInput.image.map((image, index) => {
      return {
        image,
        isMain: uploadImagesInput.isMain[index],
        isContents: uploadImagesInput.isContents[index],
        contentsOrder: uploadImagesInput.contentsOrder[index],
        isAuth: uploadImagesInput.isAuth[index],
        userId: uploadImagesInput.userId[index],
      };
    });
    const user = await Promise.all(
      uploadImagesInput.userId.map(
        async (userId) => await this.usersService.findOneByUserId(userId),
      ),
    );
    return await this.imageService.uploadMany({ data, user });
  }
}
