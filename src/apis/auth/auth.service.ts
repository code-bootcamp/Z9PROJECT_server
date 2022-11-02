import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER, Inject } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService, //

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  setRefreshToken({ user, res }) {
    const refreshToken = this.jwtService.sign(
      { email: user.loginId, sub: user.id },
      { secret: process.env.REFRESH_TOKEN_KEY, expiresIn: '2w' },
    );

    // 개발환경용
    res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; path=/;`);

    // 배포환경용 - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
    // res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; path=/; domain=??.zero9.com; SameSite=None; Secure; httpOnly;`)
    // res.setHeader('Access-Control-Allow-Origin', 'https://zero9.shop')
  }

  getAccessToken({ user }) {
    return this.jwtService.sign(
      { email: user.loginId, sub: user.id },
      { secret: process.env.ACCESS_TOKEN_KEY, expiresIn: '1h' },
    );
  }

  verifyToken(accToken, refreshToken) {
    let decodedAccToken = null;
    let decodedRefreshToken = null;
    try {
      decodedAccToken = jwt.verify(accToken, process.env.ACCESS_TOKEN_KEY);
      decodedRefreshToken = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_KEY,
      );
    } catch (err) {
      throw new UnauthorizedException(`
          errName: ${err.name}
          message: ${err.message}
          expiredAt: ${err.expiredAt}
        `);
    }
    return { decodedAccToken, decodedRefreshToken };
  }

  async logout({ req, res }) {
    const accToken = req.headers['authorization'].replace('Bearer ', '');
    const refreshToken = req.headers['cookie'].replace('refreshToken=', '');

    this.verifyToken(accToken, refreshToken);

    const expireTTL = 60 * 30; // 추후 ttl 계산로직 수정
    await this.cacheManager.set(`accessToken:${accToken}`, accToken, {
      ttl: expireTTL,
    });
    await this.cacheManager.set(`refreshToken:${refreshToken}`, refreshToken, {
      ttl: expireTTL,
    });

    // 개발환경용
    res.setHeader('Set-Cookie', `refreshToken=; path=/;`);

    return '로그아웃에 성공했습니다.';
  }
}
