import { User, USER_TYPE_ENUM } from './entities/user.entity';
import { UsersService } from './users.service';
import { CreateCommonUserInput } from './dto/createCommonUser.input';
import { CreateInfluencerInput } from './dto/createInfluencer.input';
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
    if (!influencer || influencer.userType !== USER_TYPE_ENUM.INFLUENCER) {
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
      if (!influencer || influencer.userType !== USER_TYPE_ENUM.INFLUENCER) {
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
    @Args('createUserStepId') createUserStepId: string,
    @Args('createCommonUserInput') createCommonUserInput: CreateCommonUserInput,
  ) {
    await this.usersService.checkUserBeforeCreate(createUserStepId, {
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
  async createInfluencer(
    @Args('createUserStepId') createUserStepId: string,
    @Args('createInfluencerInput') createInfluencerInput: CreateInfluencerInput,
  ) {
    await this.usersService.checkUserBeforeCreate(createUserStepId, {
      ...createInfluencerInput,
      userType: USER_TYPE_ENUM.INFLUENCER,
    });
    const { userProfileImg, influencerAuthImg, ...influencerInput } =
      createInfluencerInput;
    const user = await this.usersService.createUserInFinalStep({
      ...influencerInput,
      userType: USER_TYPE_ENUM.INFLUENCER,
    });

    if (userProfileImg) {
      const data: UploadImageInput = {
        image: createInfluencerInput.userProfileImg,
        isMain: false,
        isContents: false,
        isAuth: false,
        contentsOrder: null,
        userId: user.id,
      };
      const result = await this.imageService.uploadOne({ data, user });
      console.log('!! == userProfileImg 이미지 결과 == : ', result);
    }

    if (influencerAuthImg) {
      const data: UploadImageInput = {
        image: createInfluencerInput.influencerAuthImg,
        isMain: false,
        isContents: false,
        isAuth: true,
        contentsOrder: null,
        userId: user.id,
      };
      const result = await this.imageService.uploadOne({ data, user });
      console.log('!! == influencerAuthImg 이미지 결과 == : ', result);
    }

    return user;
  }

  @Query(() => Boolean, {
    description: 'check if user nickname is already exist',
  })
  async checkNickname(@Args('nickName') nickName: string) {
    if (await this.usersService.findOneByNickName(nickName)) return true;

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
    @Args('loginPassword') loginPassword: string,
    @Context() ctx: IContext,
  ) {
    if (userId !== ctx.req.user.id)
      throw new UnauthorizedException(
        '로그인한 회원의 정보는 본인만 수정 가능합니다.',
      );
    return this.updateUser(userId, { loginPassword });
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
