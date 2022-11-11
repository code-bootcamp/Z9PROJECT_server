import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { PointHistory } from './entities/pointHistory.entity';
import { PointsHistoryResolver } from './pointsHistory.resolver';
import { PointsHistoryService } from './pointsHistory.service';
import { User } from '../users/entities/user.entity';
import { IamportService } from '../iamport/iamport.service';

@Module({
  imports: [TypeOrmModule.forFeature([PointHistory, User])],
  providers: [PointsHistoryResolver, PointsHistoryService, IamportService],
})
export class PointsHistoryModule {}
