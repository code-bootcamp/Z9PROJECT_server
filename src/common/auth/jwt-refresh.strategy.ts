import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER, Inject, UnauthorizedException } from '@nestjs/common';

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

  async validate(req, payload) {
    const token = req.headers.authorization.replace('Bearer ', '');
    const isToken = await this.cacheManager.get(`accessToken:${token}`);

    if (isToken) throw new UnauthorizedException('레디스 블랙리스트');

    return {
      loginId: payload.loginId,
      id: payload.sub,
    };
  }
}
