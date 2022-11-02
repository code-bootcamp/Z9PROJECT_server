import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/createUser.input';
import { UpdateUserInput } from './dto/updateUser.input';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { IContext } from 'src/common/types/context';
import { UnauthorizedException, UseGuards } from '@nestjs/common';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User)
  fetchUser(@Args('userId') userId: string) {
    return this.usersService.findOneByLoginId(userId);
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => User)
  fetchLoginUser(@Context() context: IContext) {
    return this.usersService.findOneByLoginId(context.req.user.loginId);
  }

  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
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
    @Context() ctx: any,
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
    @Context() ctx: any,
  ) {
    if (userId !== ctx.req.user.userId)
      new UnauthorizedException('로그인한 회원정보 삭제는 본인만 가능합니다.');

    return this.usersService.delete(userId);
  }
}
