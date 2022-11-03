import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PRODUCT_END_TYPE {
  TIME_ONLY = 'TIME_ONLY',
  TOTAL_QTY = 'TOTAL_QTY',
}

// enum타입을 graphql에 등록
registerEnumType(PRODUCT_END_TYPE, {
  name: 'PRODUCT_END_TYPE',
});

@Entity()
@ObjectType()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  @Field(() => String, { nullable: false })
  name: string;

  @Column({ type: 'int', nullable: false })
  @Field(() => Number, { nullable: false })
  originPrice: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  @Field(() => Number, { nullable: true })
  discountRate: number;

  @Column({ type: 'int', nullable: true })
  @Field(() => Number, { nullable: true })
  discountPrice: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  @Field(() => String, { nullable: false })
  delivery: string;

  @Column({ type: 'enum', enum: PRODUCT_END_TYPE, nullable: false })
  @Field(() => PRODUCT_END_TYPE, { nullable: false })
  endType: string;

  @Column({ type: 'datetime', nullable: false })
  @Field(() => Date, { nullable: false })
  validFrom: Date;

  @Column({ type: 'datetime', nullable: false })
  @Field(() => Date, { nullable: false })
  validUntil: Date;

  @Column({ type: 'text', nullable: true })
  @Field(() => String, { nullable: true })
  content: string;

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
