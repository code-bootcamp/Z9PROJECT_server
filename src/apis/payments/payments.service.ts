import { IamportService } from './../iamport/iamport.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Payment, PAYMENT_STATUS_ENUM } from './entities/payment.entity';
import { Point, POINT_STATUS_ENUM } from '../points/entities/point.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Point)
    private readonly pointsRepository: Repository<Point>,
    private readonly usersService: UsersService,
    private readonly iamportService: IamportService,
    private readonly connection: Connection,
  ) {}

  async createPayment({ impUid, amount, userId }) {
    //LOGGING
    console.log(new Date(), ' | PaymentsService.createPayment()');
    // INIT queryRunner
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    // START TRANSACTION
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      // FIND USER
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      // VALIDATE PAYMENT
      const isPaymentExist = await this.paymentsRepository
        .createQueryBuilder('payment')
        .useTransaction(true)
        .setLock('pessimistic_write')
        .where('payment.impUid = :impUid', { impUid })
        .getOne();

      if (isPaymentExist) {
        throw new ConflictException('이미 결제된 거래입니다.');
      }
      const isValid = await this.iamportService.validatePayment({
        impUid,
      });
      console.log(
        new Date(),
        ' | PaymentsService.createPayment() isValid',
        isValid,
      );
      console.log(amount);
      if (isValid == null) {
        throw new ConflictException('유효하지 않은 결제입니다.');
      } else {
        if (isValid.data?.response.amount !== amount)
          throw new ConflictException('결제 금액 오류');
      }

      // CREATE POINT
      const pointData = this.pointsRepository.create({
        point: amount,
        status: POINT_STATUS_ENUM.CHARGED,
        user,
      });
      const point = await queryRunner.manager.save(Point, pointData);

      // CREATE PAYMENT
      const paymentData = this.paymentsRepository.create({
        impUid,
        amount,
        status: PAYMENT_STATUS_ENUM.COMPLETE,
        user,
        point,
      });
      const payment = await queryRunner.manager.save(Payment, paymentData);

      // COMMIT TRANSACTION
      await queryRunner.commitTransaction();

      //LOGGING
      console.log(
        new Date(),
        ' | PaymentsService.createPayment() payment',
        payment,
      );

      return payment;
    } catch (error) {
      // ROLLBACK TRANSACTION
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // RELEASE QUERY RUNNER
      await queryRunner.release();
    }
  }

  async refundPayment({ impUid, amount, userId }) {
    //LOGGING
    console.log(new Date(), ' | PaymentsService.refundPayment()');

    // INIT queryRunner
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    // START TRANSACTION
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      // FIND USER
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      // CHECK IF ALREADY REFUNDED
      const isRefund = await this.paymentsRepository
        .createQueryBuilder('payment')
        .setLock('pessimistic_write')
        .where('payment.impUid = :impUid', { impUid })
        .andWhere('payment.status = :status', {
          status: PAYMENT_STATUS_ENUM.CANCELED,
        })
        .getRawOne();
      if (isRefund) {
        throw new ConflictException('이미 환불된 거래입니다.');
      }

      // VALIDATE PAYMENT
      const isValid = await this.iamportService.validatePayment({
        impUid,
      });
      if (isValid == null) {
        throw new ConflictException('유효하지 않은 결제입니다.');
      }

      // FIND PAYMENT
      const payment = await this.paymentsRepository
        .createQueryBuilder('payment')
        .setLock('pessimistic_write')
        .where('payment.impUid = :impUid', { impUid })
        .andWhere('payment.status = :status', {
          status: PAYMENT_STATUS_ENUM.COMPLETE,
        })
        .getOne();
      if (!payment) {
        throw new ConflictException('결제가 존재하지 않습니다.');
      }

      // REQUEST REFUND
      const refund = await this.iamportService.refundPayment({
        impUid,
        amount,
      });

      // UPDATE POINT
      const point = await this.pointsRepository.create({
        point: 0 - refund.response.cancel_amount,
        status: POINT_STATUS_ENUM.CANCELED,
        user,
      });
      await queryRunner.manager.save(Point, point);

      // UPDATE PAYMENT
      payment.status = PAYMENT_STATUS_ENUM.CANCELED;
      await queryRunner.manager.save(Payment, payment);

      // COMMIT TRANSACTION
      await queryRunner.commitTransaction();

      //LOGGING
      console.log(
        new Date(),
        ' | PaymentsService.refundPayment() payment',
        payment,
      );

      return payment;
    } catch (error) {
      // ROLLBACK TRANSACTION
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // RELEASE QUERY RUNNER
      await queryRunner.release();
    }
  }
}
