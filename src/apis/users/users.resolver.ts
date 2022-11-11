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
import { SmsAuth } from '../auth/sms.service';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, { description: 'fetching single creator by userId' })
  async fetchCreator(@Args('userId') userId: string) {
    const creator = await this.usersService.findOneByUserId(userId);
    if (!creator || creator.userType !== USER_TYPE_ENUM.CREATOR) {
      throw new UnprocessableEntityException(
        'userId가 잘못됐거나, 해당 유저가 인플루언서가 아닙니다.',
      );
    }

    return creator;
  }

  @Query(() => [User], { description: 'fetching multiple creators' })
  async fetchCreators(
    @Args({ name: 'usersId', type: () => [String] }) usersId: string[],
  ) {
    let creator = null;
    const creators = usersId.map(async (userId) => {
      creator = await this.usersService.findOneByUserId(userId);
      if (!creator || creator.userType !== USER_TYPE_ENUM.CREATOR) {
        throw new UnprocessableEntityException(
          'userId가 잘못됐거나, 해당 유저가 인플루언서가 아닙니다.',
        );
      }
      return creator;
    });

    return creators;
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
    console.log(createCommonUserInput);
    createCommonUserInput.phoneNumber = SmsAuth.getCorrectPhoneNumber(
      createCommonUserInput.phoneNumber,
    );

    await this.usersService.checkUserBeforeCreate(signupId, {
      ...createCommonUserInput,
      userType: USER_TYPE_ENUM.COMMON_USER,
    });

    const user: User = await this.usersService.createUserInFinalStep({
      ...createCommonUserInput,
      userType: USER_TYPE_ENUM.COMMON_USER,
    });
    console.log(user);
    return user;
  }

  @Mutation(() => User, { description: 'creator signup' })
  async createCreator(
    @Args('signupId') signupId: string,
    @Args('createCreatorInput') createCreatorInput: CreateCreatorInput,
  ) {
    console.log(createCreatorInput);
    createCreatorInput.phoneNumber = SmsAuth.getCorrectPhoneNumber(
      createCreatorInput.phoneNumber,
    );

    await this.usersService.checkUserBeforeCreate(signupId, {
      ...createCreatorInput,
      userType: USER_TYPE_ENUM.CREATOR,
    });

    const user: User = await this.usersService.createUserInFinalStep({
      ...createCreatorInput,
      userType: USER_TYPE_ENUM.CREATOR,
    });
    console.log(user);
    return user;
  }

  @Mutation(() => Boolean, {
    description: 'return true if user nickname is already exist',
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
    if (userId !== ctx.req.user.id) {
      throw new UnauthorizedException(
        '로그인한 회원정보 삭제는 본인만 가능합니다.',
      );
    }

    return this.usersService.delete(userId);
  }
}
