import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Point, POINT_STATUS_ENUM } from './entities/point.entity';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(Point)
    private readonly pointsRepository: Repository<Point>,
    private readonly usersService: UsersService,
    private readonly connection: Connection,
  ) {}

  async createPoint({ amount, userId }) {
    //LOGGING
    console.log('PointsService.createPoint()');

    // INIT queryRunner
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    // START TRANSACTION
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      // FIND USER
      const user = await this.usersService.findOneByUserId(userId);

      // CREATE POINT
      const pointData = this.pointsRepository.create({
        point: amount,
        status: POINT_STATUS_ENUM.CHARGED,
        user,
      });
      const point = await queryRunner.manager.save(Point, pointData);

      // COMMIT TRANSACTION
      await queryRunner.commitTransaction();

      //LOGGING
      console.log('PointsService.createPoint() - point', point);

      return point;
    } catch (err) {
      // ROLLBACK TRANSACTION
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // RELEASE queryRunner
      await queryRunner.release();
    }
  }

  async refundPoint({ amount, userId }) {
    //LOGGING
    console.log('PointsService.refundPoint()');

    // INIT queryRunner
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    // START TRANSACTION
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      // FIND USER
      const user = await this.usersService.findOneByUserId(userId);

      // CREATE POINT
      const pointData = this.pointsRepository.create({
        point: 0 - amount,
        status: POINT_STATUS_ENUM.REFUNDED,
        user,
      });
      const point = await queryRunner.manager.save(Point, pointData);

      // COMMIT TRANSACTION
      await queryRunner.commitTransaction();

      //LOGGING
      console.log('PointsService.refundPoint() - point', point);

      return point;
    } catch (err) {
      // ROLLBACK TRANSACTION
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // RELEASE queryRunner
      await queryRunner.release();
    }
  }

  async updateUserPoint({ userId }) {
    //LOGGING
    console.log('PointsService.updateUserPoint()');

    // INIT queryRunner
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    // START TRANSACTION
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      // FIND USER
      const user = await this.usersService.findOneByUserId(userId);

      // UPDATE USER POINT
      const userPoint = await this.pointsRepository
        .createQueryBuilder('point')
        .select('SUM(point.point)', 'userPoint')
        .where('point.user = :userId', { userId: user.id })
        .getRawOne();
      user.point = userPoint.userPoint;
      await queryRunner.manager.save(User, user);

      // COMMIT TRANSACTION
      await queryRunner.commitTransaction();

      //LOGGING
      console.log('PointsService.updateUserPoint() - user', user);

      return user;
    } catch (err) {
      // ROLLBACK TRANSACTION
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // RELEASE queryRunner
      await queryRunner.release();
    }
  }

  async findAllHistoryByOrderId({ orderId }) {
    //LOGGING
    console.log('PointsService.findAllHistoryByOrderId()');

    return this.pointsRepository
      .createQueryBuilder('point')
      .leftJoinAndSelect('point.user', 'user')
      .leftJoinAndSelect('point.order', 'order')
      .where('point.order = :orderId', { orderId })
      .getMany();
  }

  async findAllHistoryByUserId({ userId }) {
    //LOGGING
    console.log('PointsService.findAllHistoryByUserId()');

    return this.pointsRepository
      .createQueryBuilder('point')
      .leftJoinAndSelect('point.user', 'user')
      .leftJoinAndSelect('point.order', 'order')
      .where('point.user = :userId', { userId })
      .getMany();
  }

  async getPoint({ userId }) {
    //LOGGING
    console.log('PointsService.getPoint()');

    return this.pointsRepository
      .createQueryBuilder('point')
      .select('SUM(point.point)', 'userPoint')
      .where('point.user = :userId', { userId })
      .getRawOne();
  }
}
