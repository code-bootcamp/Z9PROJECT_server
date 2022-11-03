import {
  CACHE_MANAGER,
  Inject,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { IContext } from 'src/common/types/context';
import {
  GqlAuthAccessGuard,
  GqlAuthRefreshGuard,
} from 'src/common/auth/gql-auth.guard';
import { Cache } from 'cache-manager';
import { SmsAuth } from './sms.service.js';
import { ISmsToken } from 'src/common/types/auth.types';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService, //
    private readonly usersService: UsersService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
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

    this.authService.setRefreshToken({ user, res: context.res });

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

  @Mutation(() => String)
  async postSmsToken(@Args('phone') phone: string) {
    if (!SmsAuth.checkPhoneDigit(phone))
      throw new UnprocessableEntityException('휴대폰 번호를 확인해주세요.');

    const token = SmsAuth.getSmsToken();
    if (!token)
      throw new UnprocessableEntityException('토큰 생성에 실패했습니다.');

    await this.cacheManager.set(
      `smsToken:${phone}`,
      JSON.stringify({ isAuth: false, token: token }),
      {
        ttl: 60,
      },
    );

    await SmsAuth.sendSmsTokenToPhone(phone, token);

    return '핸드폰으로 인증 문자가 전송되었습니다!';
  }

  private checkAndUpdateSmsToken = async (phone, token) => {
    const cacheResult: string = await this.cacheManager.get(
      `smsToken:${phone}`,
    );
    const smsToken: ISmsToken = JSON.parse(cacheResult);

    if (!smsToken)
      throw new UnprocessableEntityException(
        '핸드폰 번호가 디비(Cache)에 존재하지 않거나 인증되지 않았습니다',
      );

    if (smsToken.token !== token) {
      throw new UnprocessableEntityException(
        '에러! 토큰 번호가 일치하지 않습니다.',
      );
    } else if (smsToken.token === token) {
      await this.cacheManager.set(
        `smsToken:${phone}`,
        JSON.stringify({ isAuth: true, token: token }),
      );

      return true;
    }
  };

  @Mutation(() => Boolean)
  async patchSmsToken(
    @Args('phone') phone: string,
    @Args('smsToken') smsToken: string,
  ) {
    if (await this.checkAndUpdateSmsToken(phone, smsToken)) return true;

    return false;
  }
}
