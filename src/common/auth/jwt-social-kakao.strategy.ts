import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';

/** 'kakao' strategy  (소셜로그인용)
 *    :  src/commons/auth/파일안 AuthController 에서 'kakao' 이 이름으로 연동해서 사용
 */
export class JwtKakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      // clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: process.env.KAKAO_CALLBACK_URL,
      scope: ['account_email', 'profile_nickname'],
    });
  }

  validate(accessToken, refreshToken, profile) {
    const profileJson = profile._json;
    const kakao_account = profileJson.kakao_account;

    console.log('profile: ', profile);
    console.log('profileJson: ', profileJson);
    console.log('kakao_account: ', kakao_account);

    return {
      email: kakao_account.email,
      nickname: profile.displayName,
    };
  }
}
