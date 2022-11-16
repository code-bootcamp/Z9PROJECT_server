import { SNS_TYPE_ENUM, User, USER_TYPE_ENUM } from './entities/user.entity';
import { UsersService } from './users.service';
import { CreateCommonUserInput } from './dto/createCommonUser.input';
import { CreateCreatorInput } from './dto/createCreator.input';
import { UpdateUserInput } from './dto/updateUser.input';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { IContext } from 'src/common/types/context';
import { UseGuards } from '@nestjs/common';
import { SmsAuth } from '../auth/sms.service';
import { CreateUserInput } from './dto/createUser.input';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // @Query(() => User, { description: 'fetching single creator by userId' })
  // async fetchCreator(@Args('userId') userId: string) {
  //   //LOGGING
  //   console.log(new Date(), ' | API fetch creator requested');

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
    console.log(new Date(), ' | API fetch creators requested');

    return await this.usersService.findAllCreator();
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => User, { description: 'fetching user details logined' })
  async fetchUser(@Context() context: IContext) {
    //LOGGING
    console.log(new Date(), ' | API fetch user requested');

    return await this.usersService.findOneByUserId(context.req.user.id);
  }

  @Mutation(() => User, { description: 'user signup' })
  async createUser(
    @Args('signupId') signupId: string,
    @Args('createCommonUserInput') createCommonUserInput: CreateCommonUserInput,
  ) {
    //LOGGING
    console.log(new Date(), ' | API create user requested');

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
    console.log(new Date(), ' | API create creator requested');

    createCreatorInput.phoneNumber = SmsAuth.getCorrectPhoneNumber(
      createCreatorInput.phoneNumber,
    );

    await this.usersService.checkBankHolder({ createCreatorInput });

    await this.usersService.checkUserBeforeCreate(signupId, {
      ...createCreatorInput,
      userType: USER_TYPE_ENUM.CREATOR,
    });

    if (createCreatorInput.snsChannel === SNS_TYPE_ENUM.YOUTUBE) {
      const data = await this.usersService.getYoutubeInfo({
        chennelId: createCreatorInput.snsId,
      });
      if (data.items[0].statistics.hiddenSubscriberCount == true) {
        createCreatorInput.followerNumber = 0;
      } else {
        createCreatorInput.followerNumber =
          data.items[0].statistics.subscriberCount;
      }
      createCreatorInput.snsName = data.items[0].snippet.title;
    } else if (createCreatorInput.snsChannel === SNS_TYPE_ENUM.INSTAGRAM) {
      createCreatorInput.snsName = createCreatorInput.snsId;
      createCreatorInput.followerNumber = 0;
    }

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
    console.log(new Date(), ' | API check nickname requested');

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
    console.log(new Date(), ' | API update user requested');

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
    console.log(new Date(), ' | API validate password requested');

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
    console.log(new Date(), ' | API update password requested');

    return await this.updateUser(ctx.req.user.id, { password });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean, { description: 'delete user' })
  async deleteUser(@Context() ctx: IContext) {
    //LOGGING
    console.log(new Date(), ' | API delete user requested');

    return await this.usersService.delete(ctx.req.user.id);
  }
}
