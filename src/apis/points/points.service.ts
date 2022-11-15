import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Point, POINT_STATUS_ENUM } from './entities/point.entity';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(Point)
    private readonly pointsRepository: Repository<Point>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly connection: Connection,
  ) {}

  async createPoint({ amount, userId }) {
    //LOGGING
    console.log(new Date(), ' | PointsService.createPoint()');

    // INIT queryRunner
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    // START TRANSACTION
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      // FIND USER
      const user = await this.usersRepository
        .createQueryBuilder('user')
        .where('user.id = :userId', { userId })
        .getOne();

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
      console.log(new Date(), ' | PointsService.createPoint() - point', point);

      return point;
    } catch (err) {
      // ROLLBACK TRANSACTION
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // RELEASE queryRunner
      await queryRunner.release();
      await this.updateUserPoint({ userId });
    }
  }

  async refundPoint({ amount, userId }) {
    //LOGGING
    console.log(new Date(), ' | PointsService.refundPoint()');

    // INIT queryRunner
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    // START TRANSACTION
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      // FIND USER
      const user = await this.usersRepository
        .createQueryBuilder('user')
        .where('user.id = :userId', { userId })
        .getOne();

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
      console.log(new Date(), ' | PointsService.refundPoint() - point', point);

      return point;
    } catch (err) {
      // ROLLBACK TRANSACTION
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // RELEASE queryRunner
      await queryRunner.release();
      await this.updateUserPoint({ userId });
    }
  }

  async updateUserPoint({ userId }) {
    //LOGGING
    console.log(new Date(), ' | PointsService.updateUserPoint()');

    // INIT queryRunner
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    // START TRANSACTION
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      // FIND USER
      const userData = await this.usersRepository
        .createQueryBuilder('user')
        .setLock('pessimistic_write')
        .where('user.id = :userId', { userId })
        .getOne();

      // UPDATE USER POINT
      const userPoint = await this.pointsRepository
        .createQueryBuilder('point')
        .select('SUM(point.point)', 'userPoint')
        .where('point.user = :userId', { userId: userData.id })
        .getRawOne();
      userData.point = userPoint.userPoint;
      const user = await queryRunner.manager.save(User, userData);

      // COMMIT TRANSACTION
      await queryRunner.commitTransaction();

      //LOGGING
      console.log(
        new Date(),
        ' | PointsService.updateUserPoint() - user',
        user,
      );

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

  async updateSellerPoint({ productId }) {
    //LOGGING
    console.log(new Date(), ' | PointsService.updateUserPoint()');

    // INIT queryRunner
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    // START TRANSACTION
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      // FIND PRODUCT
      const product = await this.productsRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.user', 'user')
        .where('product.id = :productId', { productId })
        .getOne();

      // FIND USER
      const creatorData = await this.usersRepository
        .createQueryBuilder('user')
        .setLock('pessimistic_write')
        .where('user.id = :userId', { userId: product.user.id })
        .getOne();

      // UPDATE USER POINT
      const userPoint = await this.pointsRepository
        .createQueryBuilder('point')
        .select('SUM(point.point)', 'userPoint')
        .where('point.user = :userId', { userId: creatorData.id })
        .getRawOne();

      creatorData.point = userPoint.userPoint;
      const creator = await queryRunner.manager.save(User, creatorData);

      // COMMIT TRANSACTION
      await queryRunner.commitTransaction();

      //LOGGING
      console.log(
        new Date(),
        ' | PointsService.updateUserPoint() - user',
        creator,
      );

      return creator;
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
    console.log(new Date(), ' | PointsService.findAllHistoryByOrderId()');

    return this.pointsRepository
      .createQueryBuilder('point')
      .leftJoinAndSelect('point.user', 'user')
      .leftJoinAndSelect('point.order', 'order')
      .where('point.order = :orderId', { orderId })
      .getMany();
  }

  async countPointHistoryByUserId({ userId, startDate, endDate }) {
    //LOGGING
    console.log(new Date(), ' | PointsService.countPointHistoryByUserId()');

    if (startDate && endDate) {
      return this.pointsRepository
        .createQueryBuilder('point')
        .where('point.user = :userId', { userId })
        .andWhere('point.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .getCount();
    } else {
      return this.pointsRepository
        .createQueryBuilder('point')
        .where('point.user = :userId', { userId })
        .getCount();
    }
  }

  async findAllHistoryByUserId({ userId, startDate, endDate, page }) {
    //LOGGING
    console.log(new Date(), ' | PointsService.findAllHistoryByUserId()');

    if (startDate && endDate) {
      //최신순으로 정렬
      const result = await this.pointsRepository
        .createQueryBuilder('point')
        .leftJoinAndSelect('point.user', 'user')
        .leftJoinAndSelect('point.order', 'order')
        .where('point.user = :userId', { userId })
        .andWhere('point.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .orderBy('point.createdAt', 'DESC')
        .skip((page - 1) * 10)
        .take(10)
        .getMany();
      return result;
    } else {
      //최신순으로 정렬
      const result = await this.pointsRepository
        .createQueryBuilder('point')
        .leftJoinAndSelect('point.user', 'user')
        .leftJoinAndSelect('point.order', 'order')
        .where('point.user = :userId', { userId })
        .orderBy('point.createdAt', 'DESC')
        .skip((page - 1) * 10)
        .take(10)
        .getMany();
      return result;
    }
  }

  async getPoint({ userId }) {
    //LOGGING
    console.log(new Date(), ' | PointsService.getPoint()');

    return this.pointsRepository
      .createQueryBuilder('point')
      .select('SUM(point.point)', 'userPoint')
      .where('point.user = :userId', { userId })
      .getRawOne();
  }
}
