import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER, Inject, UnauthorizedException } from '@nestjs/common';
import { IUser } from '../types/context';

/** 'access' strategy
 *    :  GqlAuthAccessGuard 에서 'access' 란 이름으로 연동해서 사용
 */
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_TOKEN_KEY,
      passReqToCallback: true,
    });
  }

  async validate(req, payload) {
    //LOGGING
    console.log(new Date(), ' | JwtAccessStrategy.validate()');

    const token = req.headers.authorization.replace('Bearer ', '');
    const isToken = await this.cacheManager.get(`accessToken:${token}`);

    if (isToken) throw new UnauthorizedException('레디스 블랙리스트');
    const authResult: IUser = {
      email: payload.email,
      id: payload.sub,
    };

    return authResult; // 리턴값이 req.user에 저장됨.
  }
}
