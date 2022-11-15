import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Point, POINT_STATUS_ENUM } from '../points/entities/point.entity';
import { PointsService } from '../points/points.service';
import { Product } from '../product/entities/product.entity';
import { ProductService } from '../product/product.service';
import { User } from '../users/entities/user.entity';
import { Order, ORDER_STATUS } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Point)
    private readonly pointsRepository: Repository<Point>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly pointsService: PointsService,
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
      const result = await this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.user', 'user')
        .leftJoinAndSelect('order.product', 'product')
        .leftJoinAndSelect('product.user', 'user')
        .where('user.id = :userId', { userId })
        .andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .orderBy('order.createdAt', 'DESC')
        .skip((page - 1) * 10)
        .take(10)
        .getMany();
      console.log(result);
      return result;
    } else {
      const result = await this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.user', 'user')
        .leftJoinAndSelect('order.product', 'product')
        .leftJoinAndSelect('product.user', 'user')
        .where('user.id = :userId', { userId })
        .orderBy('order.createdAt', 'DESC')
        .skip((page - 1) * 10)
        .take(10)
        .getMany();
      console.log(result);
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
      await Promise.all(
        productIds.map(async (product) => {
          const order = await this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.user', 'user')
            .leftJoinAndSelect('order.product', 'product')
            .where('product.id = :productId', { productId: product.id })
            .andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
              startDate,
              endDate,
            })
            .orderBy('order.createdAt', 'DESC')
            .getMany();
          // console.log(order);
          if (order.length > 0) {
            orders.push(order);
          }
        }),
      );
      const result = orders.flat().slice((page - 1) * 10, page * 10);
      return result;
    } else {
      const productIds = await this.productService.findProductsByUserId({
        userId,
      });
      const orders = [];
      await Promise.all(
        productIds.map(async (product) => {
          const order = await this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.user', 'user')
            .leftJoinAndSelect('order.product', 'product')
            .where('product.id = :productId', { productId: product.id })
            .orderBy('order.createdAt', 'DESC')
            .getMany();
          // console.log(order);
          if (order.length > 0) {
            orders.push(order);
          }
        }),
      );
      const result = orders.flat().slice((page - 1) * 10, page * 10);
      return result;
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

  async countByCreatorId({ userId, startDate, endDate }) {
    //LOGGING
    console.log(new Date(), ' | OrdersService.countByCreatorId()');

    const productIds = await this.productService.findProductsByUserId({
      userId,
    });

    if (startDate && endDate) {
      let count = 0;
      await Promise.all(
        productIds.map(async (product) => {
          count += await this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.user', 'user')
            .leftJoinAndSelect('order.product', 'product')
            .where('product.id = :productId', { productId: product.id })
            .andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
              startDate,
              endDate,
            })
            .getCount();
        }),
      );
      return count;
    } else {
      let count = 0;
      await Promise.all(
        productIds.map(async (product) => {
          count += await this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.user', 'user')
            .leftJoinAndSelect('order.product', 'product')
            .where('product.id = :productId', { productId: product.id })
            .getCount();
        }),
      );
      return count;
    }
  }

  async countByUserId({ userId, startDate, endDate }) {
    //LOGGING
    console.log(new Date(), ' | OrdersService.countByUserId()');

    if (startDate && endDate) {
      const count = await this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.user', 'user')
        .leftJoinAndSelect('order.product', 'product')
        .where('user.id = :userId', { userId })
        .andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .getCount();
      return count;
    } else {
      const count = await this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.user', 'user')
        .leftJoinAndSelect('order.product', 'product')
        .where('user.id = :userId', { userId })
        .getCount();
      return count;
    }
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
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.id = :userId', { userId })
        .getOne();

      // FIND PRODUCT
      const product = await this.productRepository
        .createQueryBuilder('product')
        .where('product.id = :productId', { productId })
        .leftJoinAndSelect('product.user', 'user')
        .getOne();

      // CHECK IF USER HAS ENOUGH MONEY
      if (user.point < price * quantity) {
        throw new NotFoundException('Insufficient vaspene gas');
      }

      // CREATE ORDER
      const orderData = this.orderRepository.create({
        price,
        quantity,
        status: ORDER_STATUS.PAID,
        user,
        product,
      });
      const order = await queryRunner.manager.save(Order, orderData);

      product.quantity -= quantity;

      // UPDATE PRODUCT
      await queryRunner.manager.save(Product, product);

      const pointData = this.pointsRepository.create({
        point: 0 - price,
        status: POINT_STATUS_ENUM.USED,
        user,
        order,
      });
      await queryRunner.manager.save(Point, pointData);

      // FIND CREATOR
      const creator = await this.userRepository
        .createQueryBuilder('user')
        .where('user.id = :userId', { userId: product.user.id })
        .getOne();

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
      await this.pointsService.updateUserPoint({ userId });
      await this.pointsService.updateSellerPoint({ productId });
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
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.id = :userId', { userId })
        .getOne();

      // FIND ORDER
      const order = await this.orderRepository
        .createQueryBuilder('order')
        .setLock('pessimistic_write')
        .useTransaction(true)
        .leftJoinAndSelect('order.user', 'user')
        .leftJoinAndSelect('order.product', 'product')
        .where('order.id = :orderId', { orderId })
        .andWhere('order.status = :status', { status: ORDER_STATUS.PAID })
        .getOne();

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
    let productId = null;
    let userId = null;
    // START TRANSACTION
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      // FIND ORDER
      const order = await this.orderRepository
        .createQueryBuilder('order')
        .setLock('pessimistic_write')
        .useTransaction(true)
        .leftJoinAndSelect('order.user', 'user')
        .leftJoinAndSelect('order.product', 'product')
        .leftJoinAndSelect('product.user', 'user')
        .where('order.id = :orderId', { orderId })
        .andWhere('order.status = :status', {
          status: ORDER_STATUS.PENDING_REFUND,
        })
        .getOne();
      userId = order.user.id;

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
      await queryRunner.manager.save(Point, pointData);

      // FIND CREATOR
      const creator = await this.userRepository
        .createQueryBuilder('user')
        .where('user.id = :userId', { userId: order.product.user.id })
        .getOne();
      productId = order.product.id;

      // FIND PRODUCT
      const product = await this.productRepository
        .createQueryBuilder('product')
        .where('product.id = :productId', { productId })
        .getOne();

      // UPDATE PRODUCT QUANTITY
      product.quantity += order.quantity;
      await queryRunner.manager.save(Product, product);

      // UPDATE CREATOR POINT
      const creatorPointData = this.pointsRepository.create({
        point: 0 - order.price,
        status: POINT_STATUS_ENUM.CANCELED_SOLD,
        user: creator,
        order,
      });
      await queryRunner.manager.save(Point, creatorPointData);

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
      await this.pointsService.updateUserPoint({ userId });
      await this.pointsService.updateSellerPoint({ productId });
    }
  }

  async getSalesTotal({ productId }) {
    const salesTotal = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.price)', 'total')
      .leftJoinAndSelect('order.product', 'product')
      .where('product.id = :productId', { productId })
      .getRawOne();

    return salesTotal;
  }
}
