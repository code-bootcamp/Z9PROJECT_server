import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Point, POINT_STATUS_ENUM } from '../points/entities/point.entity';
import { PointsService } from '../points/points.service';
import { ProductService } from '../product/product.service';
import { UsersService } from '../users/users.service';
import { Order, ORDER_STATUS } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Point)
    private readonly pointsRepository: Repository<Point>,
    private readonly pointsService: PointsService,
    private readonly usersService: UsersService,
    private readonly productService: ProductService,
    private readonly connection: Connection,
  ) {}

  async findOneByOrderId({ orderId }) {
    //LOGGING
    console.log(new Date(), ' | OrdersService.findOneByOrderId()');
    return await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.product', 'product')
      .where('order.id = :orderId', { orderId })
      .getOne();
  }

  async findAllByUserId({ userId, startDate, endDate, page }) {
    //LOGGING
    console.log(new Date(), ' | OrdersService.findAllByUserId()');

    if (startDate && endDate) {
      const result = this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.user', 'user')
        .leftJoinAndSelect('order.product', 'product')
        .where('user.id = :userId', { userId })
        .andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .orderBy('order.createdAt', 'DESC')
        .skip((page - 1) * 10)
        .take(10)
        .getMany();
      return result;
    } else {
      const result = this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.user', 'user')
        .leftJoinAndSelect('order.product', 'product')
        .where('user.id = :userId', { userId })
        .orderBy('order.createdAt', 'DESC')
        .skip((page - 1) * 10)
        .take(10)
        .getMany();
      return result;
    }
  }

  async findAllByCreatorId({ userId, startDate, endDate, page }) {
    //LOGGING
    console.log(new Date(), ' | OrdersService.findAllByCreatorId()');

    if (startDate && endDate) {
      const productIds = await this.productService.findProductsByUserId({
        userId,
      });
      const orders = [];
      productIds.map(async (product) => {
        orders.push(
          await this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.user', 'user')
            .leftJoinAndSelect('order.product', 'product')
            .where('product.id = :productId', { productId: product.id })
            .andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
              startDate,
              endDate,
            })
            .orderBy('order.createdAt', 'DESC')
            .skip((page - 1) * 10)
            .take(10)
            .getMany(),
        );
      });
      return orders;
    } else {
      const productIds = await this.productService.findProductsByUserId({
        userId,
      });
      const orders = [];
      productIds.map(async (product) => {
        orders.push(
          await this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.user', 'user')
            .leftJoinAndSelect('order.product', 'product')
            .where('product.id = :productId', { productId: product.id })
            .orderBy('order.createdAt', 'DESC')
            .skip((page - 1) * 10)
            .take(10)
            .getMany(),
        );
      });
      return orders;
    }
  }

  async findAllByProductId({ productId }) {
    //LOGGING
    console.log(new Date(), ' | OrdersService.findAllByProductId()');
    return await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.product', 'product')
      .where('product.id = :productId', { productId })
      .getMany();
  }

  async countByCreatorId({ userId }) {
    //LOGGING
    console.log(new Date(), ' | OrdersService.countByCreatorId()');

    const productIds = await this.productService.findProductsByUserId({
      userId,
    });
    let count = 0;
    productIds.map(async (product) => {
      count += await this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.product', 'product')
        .where('product.id = :productId', { productId: product.id })
        .getCount();
    });
    return count;
  }

  async countByUserId({ userId }) {
    //LOGGING
    console.log(new Date(), ' | OrdersService.countByUserId()');

    return await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .where('user.id = :userId', { userId })
      .getCount();
  }

  async createOrder({ userId, productId, price, quantity }) {
    //LOGGING
    console.log(new Date(), ' | OrdersService.createOrder()');
    // INIT queryRunner
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    // START TRANSACTION
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      // FIND USER
      const user = await this.usersService.findOneByUserId(userId);

      // FIND PRODUCT
      const product = await this.productService.findOne({ productId });

      // CREATE ORDER
      const orderData = this.orderRepository.create({
        price,
        quantity,
        status: ORDER_STATUS.PENDING,
        user,
        product,
      });
      const order = await queryRunner.manager.save(Order, orderData);

      const pointData = this.pointsRepository.create({
        point: 0 - price,
        status: POINT_STATUS_ENUM.USED,
        user,
        order,
      });
      const point = await queryRunner.manager.save(Point, pointData);

      // FIND CREATOR
      const creator = await this.usersService.findOneByUserId(product.user.id);

      // UPDATE CREATOR POINT
      const creatorPointData = this.pointsRepository.create({
        point: price,
        status: POINT_STATUS_ENUM.SOLD,
        user: creator,
        order,
      });
      const creatorPoint = await queryRunner.manager.save(
        Point,
        creatorPointData,
      );
      await this.pointsService.updateUserPoint({ userId: creator.id });

      // COMMIT TRANSACTION
      await queryRunner.commitTransaction();

      //LOGGING
      console.log(new Date(), ' | Order Created ', order);
      return order;
    } catch (err) {
      // ROLLBACK TRANSACTION
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // RELEASE QUERY RUNNER
      await queryRunner.release();
    }
  }

  async reqCancelOrder({ userId, orderId }) {
    // INIT queryRunner
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    // START TRANSACTION
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      // FIND USER
      const user = await this.usersService.findOneByUserId(userId);

      // FIND ORDER
      const order = await this.findOneByOrderId({ orderId });
      if (order == undefined) throw new NotFoundException('Order not found');

      // UPDATE ORDER
      order.status = ORDER_STATUS.PENDING_REFUND;
      const reqOrder = await queryRunner.manager.save(Order, order);

      // COMMIT TRANSACTION
      await queryRunner.commitTransaction();

      //LOGGING
      console.log(new Date(), ' | Order Request Cancelled ', reqOrder);

      return reqOrder;
    } catch (err) {
      // ROLLBACK TRANSACTION
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // RELEASE QUERY RUNNER
      await queryRunner.release();
    }
  }

  async acceptCancelOrder({ orderId }) {
    // INIT queryRunner
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    // START TRANSACTION
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      // FIND ORDER
      const order = await this.findOneByOrderId({ orderId });
      if (order == undefined) throw new NotFoundException('Order not found');

      // UPDATE ORDER
      order.status = ORDER_STATUS.CANCELED;
      const reqOrder = await queryRunner.manager.save(Order, order);

      // UPDATE POINT
      const pointData = this.pointsRepository.create({
        point: order.price,
        status: POINT_STATUS_ENUM.RESTORED,
        user: order.user,
        order,
      });
      const point = await queryRunner.manager.save(Point, pointData);

      // FIND CREATOR
      const creator = await this.usersService.findOneByUserId(
        order.product.user.id,
      );

      // UPDATE CREATOR POINT
      const creatorPointData = this.pointsRepository.create({
        point: 0 - order.price,
        status: POINT_STATUS_ENUM.CANCELED_SOLD,
        user: creator,
        order,
      });
      const creatorPoint = await queryRunner.manager.save(
        Point,
        creatorPointData,
      );
      await this.pointsService.updateUserPoint({ userId: creator.id });

      //LOGGING
      console.log(new Date(), ' | Order Accepted Cancelled ', reqOrder);

      // COMMIT TRANSACTION
      await queryRunner.commitTransaction();

      return reqOrder;
    } catch (err) {
      // ROLLBACK TRANSACTION
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // RELEASE QUERY RUNNER
      await queryRunner.release();
    }
  }
}
