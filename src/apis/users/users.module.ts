import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { JwtAccessStrategy } from 'src/common/auth/jwt-access.strategy';
import { Image } from '../images/entities/image.entity';
import { Product } from '../product/entities/product.entity';
import { IamportService } from '../iamport/iamport.service';

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
    IamportService,
  ],
})
export class UsersModule {}
