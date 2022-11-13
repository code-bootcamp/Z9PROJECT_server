import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Answer } from 'src/apis/answer/entites/answer.entity';
import { Product } from 'src/apis/product/entities/product.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum QUESTION_STATUS_TYPE_ENUM {
  PROGRESS = 'PROGRESS',
  SOLVED = 'SOLVED',
}
registerEnumType(QUESTION_STATUS_TYPE_ENUM, {
  name: 'QUESTION_STATUS_TYPE_ENUM',
});

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

  @JoinColumn()
  @OneToOne(() => Product)
  @Field(() => Product)
  product: Product;

  @JoinColumn()
  @OneToOne(() => Product)
  @Field(() => Product)
  answer: Answer;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;
}
