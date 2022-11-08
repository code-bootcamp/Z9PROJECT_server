import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER, Inject, UnauthorizedException } from '@nestjs/common';
import { IUser } from '../types/context';

/** 'refresh' strategy
 *    :  GqlAuthAccessGuard 에서 'refresh' 이 이름으로 연동해서 사용
 */
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
    super({
      jwtFromRequest: (req) => {
        const cookie = req.headers.cookie;
        const refreshToken = cookie.replace('refreshToken=', '');
        return refreshToken;
      },
      secretOrKey: process.env.REFRESH_TOKEN_KEY,
      passReqToCallback: true,
    });
  }

  async validate(payload) {
    const authResult: IUser = {
      email: payload.email,
      id: payload.sub,
    };

    return authResult;
  }
}
