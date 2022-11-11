import { Injectable } from '@nestjs/common';
import { Between, Connection, DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PointHistory,
  POINT_HISTORY_TYPE,
} from './entities/pointHistory.entity';
import { User } from '../users/entities/user.entity';
import { start } from 'repl';
import { PointHistoryOutput } from './dto/pointHistory.output';

@Injectable()
export class PointsHistoryService {
  constructor(
    @InjectRepository(PointHistory)
    private readonly pointsRepository: Repository<PointHistory>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    // private readonly connection: Connection,
    private readonly dataSource: DataSource, // 예전 버전은 Connection 이었음
  ) {}

  async changePoint({
    useType,
    amount,
    user: _user,
    impUid = null,
    payStatus = null,
  }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    // =========== transaction 시작 ===========
    await queryRunner.startTransaction('SERIALIZABLE');
    // ========================================
    try {
      // 1. Payment 테이블에 거래기록 1줄 생성
      const point = this.pointsRepository.create({
        useType,
        amount,
        user: _user,
      });

      await queryRunner.manager.save(point);

      // // 2. 유저의 돈(point) 찾아오기
      const user = await queryRunner.manager.findOne(User, {
        where: { id: _user.id },
        lock: { mode: 'pessimistic_write' },
      });

      // // 3. 유저의 돈 업데이트
      const updateUser = this.usersRepository.create({
        ...user,
        point: user.point + amount,
      });
      await queryRunner.manager.save(updateUser);

      await queryRunner.commitTransaction();

      point.user = updateUser;
      return point;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async cancel({
    useType,
    amount,
    user: _user,
    impUid = null,
    payStatus = null,
  }) {
    const point = this.pointsRepository.create({
      useType,
      amount,
      user: _user,
    });
    const result = await this.pointsRepository.save(point);
    return result;
  }

  async fetchPointsHistory(userId, startDate = null, endDate = null) {
    startDate = startDate || new Date(2022, 1, 1);
    endDate = endDate || new Date();
    console.log('newDAte()', new Date(), ', endDate():', endDate);
    const result: PointHistoryOutput[] | PointHistory[] =
      await this.pointsRepository.find({
        where: {
          user: { id: userId },
          createdAt: Between(startDate, endDate),
        },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
    return result;
  }

  // async updatePointTotal(userid) {
  //   const queryRunner = this.connection.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();
  //   try {
  //     const { activePoint } = await this.pointsRepository
  //       .createQueryBuilder('point')
  //       .select('SUM(point.point)', 'activePoint')
  //       .where('point.user = :user', { user: userid })
  //       .getRawOne();
  //     console.log('activePoint : ', activePoint);
  //     await queryRunner.manager.findOne(User, {
  //       where: { id: userid },
  //       lock: { mode: 'pessimistic_write' },
  //     });
  //     await queryRunner.manager.update(
  //       User,
  //       { id: userid },
  //       { point: activePoint },
  //     );

  //     await queryRunner.commitTransaction();

  //     return activePoint;
  //   } catch (error) {
  //     await queryRunner.rollbackTransaction();
  //     throw error;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }
}
