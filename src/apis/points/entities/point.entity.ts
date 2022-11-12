import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum POINT_STATUS_ENUM {
  CREDIT = 'CREDIT',
  USED = 'USED',
  CANCELED = 'CANCELED',
  REFUND = 'REFUND',
}

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
    default: POINT_STATUS_ENUM.CREDIT,
  })
  @Field(() => POINT_STATUS_ENUM)
  status: POINT_STATUS_ENUM;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @ManyToOne(() => User)
  @Field(() => User, { nullable: true })
  user: User;
}
