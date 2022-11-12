import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum POINT_HISTORY_TYPE {
  CHARGE = 'CHARGE', // + , 포인트 충전 (FE에서 iamport 결제 후 정보넘김)
  BUY = 'BUY', // - , 제품구매
  USER_PROD_REFUND = 'USER_PROD_REFUND', // + , 구매한 제품 환불
  PT_REFUND = 'PT_REFUND', // - , 포인트 환불 => 계좌로 인출
  WITHDRAW = 'WITHDRAW', // - , 포인트를 계좌로 인출

  SELL = 'SELL', // + , 제품판매
  CREATOR_PROD_REFUND = 'CREATOR_PROD_REFUND', // -, 판매한 제품 환불처리
}

registerEnumType(POINT_HISTORY_TYPE, {
  name: 'POINT_HISTORY_TYPE',
});

/** ready:미결제, paid:결제완료, cancelled:결제취소, failed:결제실패 */
export enum PAYMENT_STATUS_ENUM {
  // READY = 'ready',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

registerEnumType(PAYMENT_STATUS_ENUM, {
  name: 'PAYMENT_STATUS_ENUM',
});

@Entity()
@ObjectType()
export class PointHistory {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String, { nullable: true })
  id: string;

  @Column({
    type: 'enum',
    enum: POINT_HISTORY_TYPE,
    // default: POINT_HISTORY_TYPE.CHARGE,
  })
  @Field(() => POINT_HISTORY_TYPE, { nullable: true })
  useType: POINT_HISTORY_TYPE;

  @Column({ type: 'int' })
  @Field(() => Number, { nullable: true })
  amount: number;

  @ManyToOne(() => User, { nullable: true })
  @Field(() => User, { nullable: true })
  user: User;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  impUid: string;

  @Column({
    type: 'enum',
    enum: PAYMENT_STATUS_ENUM,
    nullable: true,
  })
  @Field(() => PAYMENT_STATUS_ENUM, { nullable: true })
  payStatus: PAYMENT_STATUS_ENUM;

  @CreateDateColumn()
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date, { nullable: true })
  updatedAt: Date;

  @DeleteDateColumn()
  @Field(() => Date, { nullable: true })
  deletedAt: Date;
}
