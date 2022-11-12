import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

/** 'google' strategy  (소셜로그인용)
 *    :  src/commons/auth/파일안 AuthController 에서 'google' 이 이름으로 연동해서 사용
 */
export class JwtGoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'], // 구글/네이버 등의 Docs 에 따라 달라짐
    });
  }

  // overriding
  validate(accessToken, refreshToken, profile) {
    return {
      email: profile.emails[0].value,
      nickname: profile.displayName,
      profileImg: profile.photos[0].value,
    };
  }
}
