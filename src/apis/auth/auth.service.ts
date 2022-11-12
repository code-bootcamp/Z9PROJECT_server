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
    //LOGGING
    console.log('AuthService.setRefreshToken()');

    const refreshToken = this.jwtService.sign(
      { email: user.email, sub: user.id },
      { secret: process.env.REFRESH_TOKEN_KEY, expiresIn: '2w' },
    );

    this.setCookie(req, res, refreshToken);
  }

  setCookie(req, res, refreshToken = null, user = null) {
    //LOGGING
    console.log('AuthService.setCookie()');

    let cookie = '';
    if (process.env.DEPLOY_ENV === 'LOCAL') {
      // 로컬개발환경용
      if (refreshToken) cookie = `refreshToken=${refreshToken}; path=/;`;
      else cookie = `snsLoginInfo=${user}; path=/;`;

      res.setHeader('Set-Cookie', cookie);
    } else {
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

      if (refreshToken) {
        cookie = `refreshToken=${refreshToken}; path=/; domain=.brian-hong.tech; SameSite=None; Secure; httpOnly; Max-Age=${
          3600 * 24 * 14
        };`;
      } else {
        cookie = `snsLoginInfo=${user}; path=/;`;
      }
      res.setHeader('Set-Cookie', cookie);

      //LOGGING
      console.log('setRefreshToken', refreshToken);
    }
  }

  getAccessToken({ user }) {
    //LOGGING
    console.log('AuthService.getAccessToken()');

    return this.jwtService.sign(
      { email: user.email, sub: user.id },
      { secret: process.env.ACCESS_TOKEN_KEY, expiresIn: '1h' },
    );
  }

  verifyToken(accToken, refreshToken) {
    //LOGGING
    console.log('AuthService.verifyToken()');

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
    //LOGGING
    console.log('AuthService.logout()');

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

    if (process.env.DEPLOY_ENV === 'LOCAL') {
      // 개발환경용
      res.setHeader('Set-Cookie', `refreshToken=; path=/;`);
    } else {
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
    }
    return '로그아웃에 성공했습니다.';
  }
}
