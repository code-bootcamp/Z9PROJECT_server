import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { JwtAccessStrategy } from 'src/common/auth/jwt-access.strategy';
import { Image } from '../images/entities/image.entity';
import { ImageService } from '../images/image.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, //
      Image,
    ]),
  ],
  providers: [
    JwtAccessStrategy, //
    UsersResolver,
    UsersService,
    ImageService,
  ],
})
export class UsersModule {}
