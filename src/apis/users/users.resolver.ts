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

  // @Query(() => User, { description: 'fetching single creator by userId' })
  // async fetchCreator(@Args('userId') userId: string) {
  //   //LOGGING
  //   console.log('API fetch creator requested');

  //   const creator = await this.usersService.findOneByUserId(userId);
  //   if (!creator || creator.userType !== USER_TYPE_ENUM.CREATOR) {
  //     throw new UnprocessableEntityException(
  //       'userId가 잘못됐거나, 해당 유저가 인플루언서가 아닙니다.',
  //     );
  //   }

  //   return creator;
  // }

  @Query(() => [User], { description: 'fetching multiple creators' })
  async fetchCreators(
    @Args({ name: 'usersId', type: () => [String] }) usersId: string[],
  ) {
    //LOGGING
    console.log('API fetch creators requested');

    return await this.usersService.findAllCreator();
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => User, { description: 'fetching user details logined' })
  async fetchUser(@Context() context: IContext) {
    //LOGGING
    console.log('API fetch user requested');

    return await this.usersService.findOneByUserId(context.req.user.id);
  }

  @Mutation(() => User, { description: 'user signup' })
  async createUser(
    @Args('signupId') signupId: string,
    @Args('createCommonUserInput') createCommonUserInput: CreateCommonUserInput,
  ) {
    //LOGGING
    console.log('API create user requested');

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
    //LOGGING
    console.log('API create creator requested');

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
    //LOGGING
    console.log('API check nickname requested');

    if (await this.usersService.findOneByNickName(nickname)) return true;
    return false;
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => User, { description: 'update user detail' })
  async updateUser(
    @Args('userId') userId: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    //LOGGING
    console.log('API update user requested');

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
    //LOGGING
    console.log('API validate password requested');

    return await this.usersService.isSameLoginPassword(
      ctx.req.user.id,
      prevPassword,
    );
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => User, { description: 'update user password' })
  async updatePassword(
    @Args('password') password: string,
    @Context() ctx: IContext,
  ) {
    //LOGGING
    console.log('API update password requested');

    return await this.updateUser(ctx.req.user.id, { password });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean, { description: 'delete user' })
  async deleteUser(@Context() ctx: IContext) {
    //LOGGING
    console.log('API delete user requested');

    return await this.usersService.delete(ctx.req.user.id);
  }
}
