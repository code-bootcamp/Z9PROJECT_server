import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from 'src/apis/product/entities/product.entity';
import { User } from 'src/apis/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class ProductLike {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String, { nullable: false })
  id: string;

  // TODO: Add relations
  @ManyToOne(() => User)
  @Field(() => User, { nullable: false })
  user: User;

  // TODO: Add relations
  @ManyToOne(() => Product)
  @Field(() => Product, { nullable: false })
  product: Product;

  @Column()
  @Field(() => Date, { nullable: false, description: 'Date of creation' })
  createdAt: Date;

  @Column()
  @Field(() => Date, { nullable: false, description: 'Date of last update' })
  updatedAt: Date;

  @Column()
  @Field(() => Date, {
    nullable: false,
    description:
      'If this has value, it means that once it was liked and unliked. To make it status like, change this value to null',
  })
  deletedAt: Date;
}
