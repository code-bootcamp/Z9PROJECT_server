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
import { ImageUploadData } from 'src/common/types/image.types';

@Resolver()
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly imageService: ImageService,
  ) {}

  @Query(() => User)
  async fetchInfluencer(@Args('userId') userId: string) {
    const influencer = await this.usersService.findOneByUserId(userId);
    if (!influencer || influencer.userType !== USER_TYPE_ENUM.INFLUENCER) {
      throw new UnprocessableEntityException(
        'userId가 잘못됐거나, 해당 유저가 인플루언서가 아닙니다.',
      );
    }

    return influencer;
  }

  @Query(() => [User])
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
  @Query(() => User)
  fetchLoginUser(@Context() context: IContext) {
    return this.usersService.findOneByUserId(context.req.user.id);
  }

  @Mutation(() => User)
  async createCommonUser(
    @Args('createUserStepId') createUserStepId: string,
    @Args('createCommonUserInput') createCommonUserInput: CreateCommonUserInput,
  ) {
    await this.usersService.checkUserBeforeCreate(createUserStepId, {
      ...createCommonUserInput,
      userType: USER_TYPE_ENUM.COMMON_USER,
    });

    const { userProfileImg, ...commonUserInput } = createCommonUserInput;
    const user = await this.usersService.createUserInFinalStep({
      ...commonUserInput,
      userType: USER_TYPE_ENUM.COMMON_USER,
    });

    if (userProfileImg) {
      const data: ImageUploadData = {
        image: createCommonUserInput.userProfileImg,
        isMain: true,
        isContents: false,
        // contentsOrder: contentsOrder ? contentsOrder : null,
        user: user,
      };
      const result = await this.imageService.uploadOne({ data });
      console.log('!! == 이미지 결과 == : ', result);
    }

    return user;
  }

  @Mutation(() => User)
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
      const data: ImageUploadData = {
        image: createInfluencerInput.userProfileImg,
        isMain: true,
        isContents: false,
        // contentsOrder: contentsOrder ? contentsOrder : null,
        user: user,
      };
      const result = await this.imageService.uploadOne({ data });
      console.log('!! == userProfileImg 이미지 결과 == : ', result);
    }

    if (influencerAuthImg) {
      const data: ImageUploadData = {
        image: createInfluencerInput.influencerAuthImg,
        isMain: false,
        isContents: false,
        // contentsOrder: contentsOrder ? contentsOrder : null,
        user: user,
      };
      const result = await this.imageService.uploadOne({ data });
      console.log('!! == influencerAuthImg 이미지 결과 == : ', result);
    }

    return user;
  }

  @Query(() => Boolean)
  async isNickNameDuplicated(@Args('nickName') nickName: string) {
    if (await this.usersService.findOneByNickName(nickName)) return true;

    return false;
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => User)
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
  @Query(() => Boolean)
  async checkSamePasswordBeforeChangePwd(
    @Args('prevPassword') prevPassword: string,
    @Context() ctx: IContext,
  ) {
    return await this.usersService.isSameLoginPassword(
      ctx.req.user.id,
      prevPassword,
    );
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => User)
  async updateUserPwd(
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
  @Mutation(() => Boolean)
  deleteLoginUser(
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
