import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Point } from 'src/apis/points/entities/point.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PAYMENT_STATUS_ENUM {
  CANCELED = 'CANCELED',
  CANCEL_REQUESTED = 'CANCEL_REQUESTED',
  COMPLETE = 'COMPLETE',
}

registerEnumType(PAYMENT_STATUS_ENUM, {
  name: 'PAYMENT_STATUS_ENUM',
});

@Entity()
@ObjectType()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column({ type: 'varchar', length: 50 })
  @Field(() => String)
  impUid: string;

  @Column({ type: 'int', default: 0 })
  @Field(() => Number)
  amount: number;

  @Column({
    type: 'enum',
    enum: PAYMENT_STATUS_ENUM,
    default: PAYMENT_STATUS_ENUM.COMPLETE,
  })
  @Field(() => PAYMENT_STATUS_ENUM)
  status: PAYMENT_STATUS_ENUM;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date, { nullable: true })
  updatedAt: Date;

  @ManyToOne(() => User)
  @Field(() => User, { nullable: true })
  user: User;

  @JoinColumn()
  @OneToOne(() => Point)
  @Field(() => Point, { nullable: true })
  point: Point;
}
