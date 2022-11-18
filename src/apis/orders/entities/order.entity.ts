import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Product } from 'src/apis/product/entities/product.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ORDER_STATUS {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PENDING_REFUND = 'PENDING_REFUND',
  CANCELED = 'CANCELED',
}

registerEnumType(ORDER_STATUS, {
  name: 'ORDER_STATUS',
});

@Entity()
@ObjectType()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column({ type: 'int', default: 0 })
  @Field(() => Int)
  price: number;

  @Column({ type: 'int', default: 0 })
  @Field(() => Int)
  quantity: number;

  @Column({ type: 'enum', enum: ORDER_STATUS, default: ORDER_STATUS.PENDING })
  @Field(() => ORDER_STATUS)
  status: ORDER_STATUS;

  @CreateDateColumn()
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date, { nullable: true })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @Field(() => User, { nullable: true })
  user: User;

  @ManyToOne(() => Product, { nullable: true })
  @Field(() => Product, { nullable: true })
  product: Product;
}
