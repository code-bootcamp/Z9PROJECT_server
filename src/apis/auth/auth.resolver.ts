import {
  CACHE_MANAGER,
  Inject,
  ServiceUnavailableException,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { Args, Context, Int, Mutation, Resolver } from '@nestjs/graphql';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { IContext } from 'src/common/types/context';
import {
  GqlAuthAccessGuard,
  GqlAuthRefreshGuard,
} from 'src/common/auth/gql-auth.guard';
import { Cache } from 'cache-manager';
import { SmsAuth } from './sms.service';
import { ISmsToken, SMS_TOKEN_KEY_PREFIX } from 'src/common/types/auth.types';
import { SmsPostReturn } from './dto/sms.output';

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
    @Args('email') email: string, //
    @Args('password') password: string,
    @Context() context: IContext,
  ) {
    //LOGGING
    console.log('API Login Requested');
    const user = await this.usersService.findOneByEmail(email);
    if (!user)
      throw new UnprocessableEntityException('ID가 일치하는 유저가 없습니다.');

    const isSamePassword = await bcrypt.compare(password, user.password);
    if (!isSamePassword)
      throw new UnprocessableEntityException('비밀번호가 틀렸습니다.');

    this.authService.setRefreshToken({
      user,
      req: context.req,
      res: context.res,
    });
    //LOGGING
    console.log(`User Logined : ${user.id}`);
    return this.authService.getAccessToken({ user });
  }

  @UseGuards(GqlAuthRefreshGuard)
  @Mutation(() => String)
  restoreAccessToken(
    @Context() context: IContext, //
  ) {
    //LOGGING
    console.log('API Restore Access Token Requested');

    return this.authService.getAccessToken({ user: context.req.user });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => String)
  async logout(@Context() context: IContext) {
    //LOGGING
    console.log(`User Logout : ${context.req.user.id}`);
    return this.authService.logout({ req: context.req, res: context.res });
  }

  @Mutation(() => SmsPostReturn)
  async postSmsToken(@Args('phoneNumber') phoneNumber: string) {
    //LOGGING
    console.log('API Post Sms Token Requested');

    phoneNumber = SmsAuth.getCorrectPhoneNumber(phoneNumber);

    const smsToken = SmsAuth.getSmsToken();
    if (!smsToken)
      throw new ServiceUnavailableException('토큰 생성에 실패했습니다.');

    await SmsAuth.sendSmsTokenToPhone(phoneNumber, smsToken);

    const smsAuthTime = 120;
    await this.cacheManager.set(
      SMS_TOKEN_KEY_PREFIX + phoneNumber,
      { isAuth: false, smsToken },
      { ttl: smsAuthTime },
    );

    return {
      smsAuthTime,
      message: '핸드폰으로 인증 문자가 전송되었습니다!' + ` : ${smsToken}`,
    };
  }

  private checkAndUpdateSmsToken = async (phoneNumber, smsToken, signupId) => {
    const smsTokenResult: ISmsToken = await this.cacheManager.get(
      SMS_TOKEN_KEY_PREFIX + phoneNumber,
    );
    if (!smsTokenResult)
      throw new UnprocessableEntityException(
        '핸드폰 번호가 디비(Cache)에 존재하지 않거나 인증되지 않았습니다',
      );

    if (smsTokenResult.smsToken !== smsToken) {
      throw new UnprocessableEntityException(
        '에러! 토큰 번호가 일치하지 않습니다.',
      );
    } else if (smsTokenResult.smsToken === smsToken) {
      await this.cacheManager.set(
        SMS_TOKEN_KEY_PREFIX + phoneNumber,
        {
          isAuth: true,
          signupId,
        },
        { ttl: 3600 * 24 },
      );

      return true;
    }
  };

  @Mutation(() => Boolean)
  async patchSmsToken(
    @Args('phoneNumber') phoneNumber: string,
    @Args('smsToken') smsToken: string,
    @Args('signupId') signupId: string,
  ) {
    //LOGGING
    console.log('API Patch Sms Token Requested');

    phoneNumber = SmsAuth.getCorrectPhoneNumber(phoneNumber);
    if (await this.checkAndUpdateSmsToken(phoneNumber, smsToken, signupId))
      return true;

    return false;
  }
}
