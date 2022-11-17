import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Product } from 'src/apis/product/entities/product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class ProductView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Field(() => Int)
  viewCount: number;

  @JoinColumn()
  @OneToOne(() => Product)
  @Field(() => Product)
  product: Product;
}
