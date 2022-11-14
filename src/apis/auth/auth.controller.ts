import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { User } from '../users/entities/user.entity';

export interface IOAuthUser {
  user?: Partial<User>;
}

@Controller()
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  private async socialLogin(req: Request & IOAuthUser, res: Response) {
    let user = await this.usersService.findOneByEmail(req.user.email);

    if (!user) {
      const { email, nickname, profileImg } = req.user;
      user = await this.usersService.createUserObj(email, nickname, profileImg);

      this.authService.setCookie(req, res, null, JSON.stringify(user));

      res.redirect(process.env.REDIRECT_SIGNUP_URL);
    } else {
      // 회원가입 이미 되있을때
      this.authService.setRefreshToken({ user, req, res });

      res.redirect(process.env.REDIRECT_MEMBER_URL);
    }
  }

  @Get('/login/google')
  @UseGuards(AuthGuard('google'))
  async loginGoogle(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response,
  ) {
    await this.socialLogin(req, res);
  }

  @Get('/login/kakao')
  @UseGuards(AuthGuard('kakao'))
  async loginKakao(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response,
  ) {
    this.socialLogin(req, res);
  }
}
