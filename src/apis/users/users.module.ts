import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { JwtAccessStrategy } from 'src/common/auth/jwt-access.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, //
    ]),
  ],
  providers: [
    JwtAccessStrategy, //
    UsersResolver,
    UsersService,
  ],
})
export class UsersModule {}
