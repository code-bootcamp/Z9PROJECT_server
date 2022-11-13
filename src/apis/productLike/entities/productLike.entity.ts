import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from 'src/apis/product/entities/product.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class ProductLike {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String, { nullable: false })
  id: string;

  @ManyToOne(() => User)
  @Field(() => User, { nullable: true })
  user: User;

  @ManyToOne(() => Product)
  @Field(() => Product, { nullable: true })
  product: Product;

  @CreateDateColumn()
  @Field(() => Date, { nullable: true, description: 'Date of creation' })
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date, { nullable: true, description: 'Date of last update' })
  updatedAt: Date;

  @DeleteDateColumn()
  @Field(() => Date, {
    nullable: true,
    description:
      'If this has value, it means that once it was liked and unliked. To make it status like, change this value to null',
  })
  deletedAt: Date;
}
