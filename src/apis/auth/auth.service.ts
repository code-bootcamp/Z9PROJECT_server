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

  setRefreshToken({ user, req, res }) {
    const refreshToken = this.jwtService.sign(
      { email: user.email, sub: user.id },
      { secret: process.env.REFRESH_TOKEN_KEY, expiresIn: '2w' },
    );
    const originList = process.env.ORIGIN_LIST.split(',');
    const origin = req.headers.origin;
    if (originList.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, HEAD, POST, OPTIONS, PUT, PATCH, DELETE',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, Origin, Accept, Access-Control-Request-Method, Access-Control-Request-Headers',
    );
    res.setHeader(
      'Set-Cookie',
      `refreshToken=${refreshToken}; path=/; domain=.brian-hong.tech; SameSite=None; Secure; httpOnly; Max-Age=${
        3600 * 24 * 14
      };`,
    );
  }

  getAccessToken({ user }) {
    return this.jwtService.sign(
      { email: user.email, sub: user.id },
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

    const originList = process.env.ORIGIN_LIST.split(',');
    const origin = req.headers.origin;
    if (originList.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, HEAD, POST, OPTIONS, PUT, PATCH, DELETE',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, Origin, Accept, Access-Control-Request-Method, Access-Control-Request-Headers',
    );
    res.setHeader(
      'Set-Cookie',
      `refreshToken=; path=/; domain=.brian-hong.tech; SameSite=None; Secure; httpOnly; Max-Age=0;`,
    );

    return '로그아웃에 성공했습니다.';
  }
}
