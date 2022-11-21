import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Order } from 'src/apis/orders/entities/order.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum POINT_STATUS_ENUM {
  // 충전 시 +
  CHARGED = 'CHARGED',
  // 선물 포인트 +
  GIFTED = 'GIFTED',
  // 결제 취소 시 포인트 복구 +
  RESTORED = 'RESTORED',
  // 결제 시 -
  USED = 'USED',
  // 환불 시 +
  CANCELED = 'CANCELED',
  // 환급 시 -
  REFUNDED = 'REFUNDED',
  // 판매 시 +
  SOLD = 'SOLD',
  // 판매 취소 시 -
  CANCELED_SOLD = 'CANCELED_SOLD',
}

registerEnumType(POINT_STATUS_ENUM, {
  name: 'POINT_STATUS_ENUM',
});

@Entity()
@ObjectType()
export class Point {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column({ type: 'int', default: 0 })
  @Field(() => Number)
  point: number;

  @Column({
    type: 'enum',
    enum: POINT_STATUS_ENUM,
    default: POINT_STATUS_ENUM.CHARGED,
  })
  @Field(() => POINT_STATUS_ENUM)
  status: POINT_STATUS_ENUM;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @Field(() => User, { nullable: true })
  user: User;

  @ManyToOne(() => Order, { nullable: true })
  @Field(() => Order, { nullable: true })
  order: Order;
}
