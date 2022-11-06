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

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

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
    return this.usersService.create(createUserStepId, {
      ...createCommonUserInput,
      userType: USER_TYPE_ENUM.COMMON_USER,
    });
  }

  @Mutation(() => User)
  async createInfluencer(
    @Args('createUserStepId') createUserStepId: string,
    @Args('createInfluencerInput') createInfluencerInput: CreateInfluencerInput,
  ) {
    return this.usersService.create(createUserStepId, {
      ...createInfluencerInput,
      userType: USER_TYPE_ENUM.INFLUENCER,
    });
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
  @Mutation(() => User)
  async updateUserPwd(
    @Args('userId') userId: string,
    @Args('loginPassword') loginPassword: string,
    @Context() ctx: IContext,
  ) {
    if (userId !== ctx.req.user.userId)
      new UnauthorizedException(
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
    if (userId !== ctx.req.user.userId)
      new UnauthorizedException('로그인한 회원정보 삭제는 본인만 가능합니다.');

    return this.usersService.delete(userId);
  }
}
