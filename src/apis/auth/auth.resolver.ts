import { UnprocessableEntityException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { IContext } from 'src/common/types/context';
import {
  GqlAuthAccessGuard,
  GqlAuthRefreshGuard,
} from 'src/common/auth/gql-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService, //
    private readonly usersService: UsersService,
  ) {}

  @Mutation(() => String)
  async login(
    @Args('loginId') loginId: string, //
    @Args('loginPassword') loginPassword: string,
    @Context() context: IContext,
  ) {
    const user = await this.usersService.findOneByLoginId(loginId);
    if (!user)
      throw new UnprocessableEntityException('ID가 일치하는 유저가 없습니다.');

    const isSamePassword = await bcrypt.compare(
      loginPassword,
      user.loginPassword,
    );
    if (!isSamePassword)
      throw new UnprocessableEntityException('비밀번호가 틀렸습니다.');

    this.authService.setRefreshToken({
      user,
      req: context.req,
      res: context.res,
    });

    return this.authService.getAccessToken({ user });
  }

  @UseGuards(GqlAuthRefreshGuard)
  @Mutation(() => String)
  restoreAccessToken(
    @Context() context: IContext, //
  ) {
    return this.authService.getAccessToken({ user: context.req.user });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => String)
  async logout(@Context() context: IContext) {
    return this.authService.logout({ req: context.req, res: context.res });
  }
}
