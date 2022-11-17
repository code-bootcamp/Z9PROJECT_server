import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { JwtAccessStrategy } from 'src/common/auth/jwt-access.strategy';
import { Image } from '../images/entities/image.entity';
import { Product } from '../product/entities/product.entity';
import { PointsService } from '../points/points.service';
import { Point } from '../points/entities/point.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, //
      Image,
      Product,
    ]),
  ],
  providers: [
    JwtAccessStrategy, //
    UsersResolver,
    UsersService,
  ],
})
export class UsersModule {}
