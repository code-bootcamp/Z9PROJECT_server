import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from 'src/apis/product/entities/product.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String, { nullable: true })
  question: string;

  @CreateDateColumn()
  @Field(() => Date, { nullable: true })
  createdAt: Date;

<<<<<<< Updated upstream
  @UpdateDateColumn()
  @Field(() => Date, { nullable: true })
  updatedAt: Date;
=======
  @DeleteDateColumn()
  @Field(() => Date, { nullable: true })
  deletedAt: Date;

  @UpdateDateColumn()
  @Field(() => Date, { nullable: true })
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: QUESTION_STATUS_TYPE_ENUM,
    nullable: true,
    default: QUESTION_STATUS_TYPE_ENUM.PROGRESS,
  })
  @Field(() => QUESTION_STATUS_TYPE_ENUM, {
    nullable: false,
    defaultValue: QUESTION_STATUS_TYPE_ENUM.PROGRESS,
  })
  status: QUESTION_STATUS_TYPE_ENUM;
>>>>>>> Stashed changes

  @DeleteDateColumn()
  @Field(() => Date, { nullable: true })
  deletedAt: Date;

  @Column({ type: 'int', default: false })
  @Field(() => Boolean)
  isDeleted: boolean;

  @ManyToOne(() => Product)
  @Field(() => Product)
  product: Product;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;
}
