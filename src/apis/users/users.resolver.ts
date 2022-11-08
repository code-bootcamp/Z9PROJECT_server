import { User, USER_TYPE_ENUM } from './entities/user.entity';
import { UsersService } from './users.service';
import { CreateCommonUserInput } from './dto/createCommonUser.input';
import { CreateCreatorInput } from './dto/createCreator.input';
import { UpdateUserInput } from './dto/updateUser.input';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { IContext } from 'src/common/types/context';
import {
  UnauthorizedException,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { ImageService } from '../images/image.service';
import { UploadImageInput } from '../images/dto/uploadImage.input';

@Resolver()
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly imageService: ImageService,
  ) {}

  @Query(() => User, { description: 'fetching single influencer by userId' })
  async fetchInfluencer(@Args('userId') userId: string) {
    const influencer = await this.usersService.findOneByUserId(userId);
    if (!influencer || influencer.userType !== USER_TYPE_ENUM.CREATOR) {
      throw new UnprocessableEntityException(
        'userId가 잘못됐거나, 해당 유저가 인플루언서가 아닙니다.',
      );
    }

    return influencer;
  }

  @Query(() => [User], { description: 'fetching multiple influenceres' })
  async fetchInfluenceres(
    @Args({ name: 'usersId', type: () => [String] }) usersId: string[],
  ) {
    let influencer = null;
    const influenceres = usersId.map(async (userId) => {
      influencer = await this.usersService.findOneByUserId(userId);
      if (!influencer || influencer.userType !== USER_TYPE_ENUM.CREATOR) {
        throw new UnprocessableEntityException(
          'userId가 잘못됐거나, 해당 유저가 인플루언서가 아닙니다.',
        );
      }
      return influencer;
    });

    return influenceres;
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => User, { description: 'fetching user details logined' })
  fetchUser(@Context() context: IContext) {
    return this.usersService.findOneByUserId(context.req.user.id);
  }

  @Mutation(() => User, { description: 'user signup' })
  async createUser(
    @Args('signupId') signupId: string,
    @Args('createCommonUserInput') createCommonUserInput: CreateCommonUserInput,
  ) {
    await this.usersService.checkUserBeforeCreate(signupId, {
      ...createCommonUserInput,
      userType: USER_TYPE_ENUM.COMMON_USER,
    });

    const { userProfileImg, ...commonUserInput } = createCommonUserInput;
    const user: User = await this.usersService.createUserInFinalStep({
      ...commonUserInput,
      userType: USER_TYPE_ENUM.COMMON_USER,
    });

    if (userProfileImg) {
      const data: UploadImageInput = {
        image: userProfileImg,
        isMain: false,
        isContents: false,
        isAuth: false,
        contentsOrder: null,
        userId: user.id,
      };
      const result = await this.imageService.uploadOne({ data, user });
      console.log('!! == 이미지 결과 == : ', result);
    }

    return user;
  }

  @Mutation(() => User, { description: 'influencer signup' })
  async createCreator(
    @Args('signupId') signupId: string,
    @Args('createCreatorInput') createCreatorInput: CreateCreatorInput,
  ) {
    console.log('createCreatorInput : ', createCreatorInput);
    await this.usersService.checkUserBeforeCreate(signupId, {
      ...createCreatorInput,
      userType: USER_TYPE_ENUM.CREATOR,
    });
    const {
      userProfileImg,
      creatorAuthImg: creatorAuthImg,
      ...influencerInput
    } = createCreatorInput;
    const user = await this.usersService.createUserInFinalStep({
      ...influencerInput,
      userType: USER_TYPE_ENUM.CREATOR,
    });

    if (userProfileImg) {
      const data: UploadImageInput = {
        image: createCreatorInput.userProfileImg,
        isMain: false,
        isContents: false,
        isAuth: false,
        contentsOrder: null,
        userId: user.id,
      };
      const result = await this.imageService.uploadOne({ data, user });
      console.log('!! == userProfileImg 이미지 결과 == : ', result);
    }

    if (creatorAuthImg) {
      const data: UploadImageInput = {
        image: createCreatorInput.creatorAuthImg,
        isMain: false,
        isContents: false,
        isAuth: true,
        contentsOrder: null,
        userId: user.id,
      };
      const result = await this.imageService.uploadOne({ data, user });
      console.log('!! == creatorAuthImg 이미지 결과 == : ', result);
    }
    console.log(user);
    return user;
  }

  @Query(() => Boolean, {
    description: 'check if user nickname is already exist',
  })
  async checkNickname(@Args('nickname') nickname: string) {
    if (await this.usersService.findOneByNickName(nickname)) return true;
    return false;
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => User, { description: 'update user detail' })
  async updateUser(
    @Args('userId') userId: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    return this.usersService.update({
      userId,
      updateUserInput,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => Boolean, {
    description:
      'validate password if it is the same password currently using ',
  })
  async validatePassword(
    @Args('prevPassword') prevPassword: string,
    @Context() ctx: IContext,
  ) {
    return await this.usersService.isSameLoginPassword(
      ctx.req.user.id,
      prevPassword,
    );
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => User, { description: 'update user password' })
  async updatePassword(
    @Args('userId') userId: string,
    @Args('password') password: string,
    @Context() ctx: IContext,
  ) {
    if (userId !== ctx.req.user.id)
      throw new UnauthorizedException(
        '로그인한 회원의 정보는 본인만 수정 가능합니다.',
      );
    return this.updateUser(userId, { password });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean, { description: 'delete user' })
  deleteUser(
    @Args('userId') userId: string, //
    @Context() ctx: IContext,
  ) {
    console.log('userId: ', userId);
    console.log('ctx.req.user:', ctx.req.user);
    if (userId !== ctx.req.user.id) {
      throw new UnauthorizedException(
        '로그인한 회원정보 삭제는 본인만 가능합니다.',
      );
    }

    return this.usersService.delete(userId);
  }
}
