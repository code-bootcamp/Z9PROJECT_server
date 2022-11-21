import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtRefreshStrategy } from 'src/common/auth/jwt-refresh.strategy';
import { AuthController } from './auth.controller';
import { JwtGoogleStrategy } from 'src/common/auth/jwt-social-google.strategy';
import { JwtKakaoStrategy } from 'src/common/auth/jwt-social-kakao.strategy';
import { Point } from '../points/entities/point.entity';
import { PointsService } from '../points/points.service';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [
    JwtModule.register({}), //
    TypeOrmModule.forFeature([
      User, //
      Point,
      Product,
    ]),
  ],
  providers: [
    JwtRefreshStrategy, //
    JwtGoogleStrategy,
    JwtKakaoStrategy,
    AuthResolver,
    AuthService,
    UsersService,
    PointsService,
  ],
  controllers: [
    AuthController, //
  ],
})
export class AuthModule {}
