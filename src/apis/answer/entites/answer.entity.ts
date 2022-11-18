import { Field, ObjectType } from '@nestjs/graphql';
import { Question } from 'src/apis/question/entities/question.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column({ type: 'text', nullable: false })
  @Field(() => String, { nullable: false })
  answer: string;

  @CreateDateColumn()
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date, { nullable: true })
  updatedAt: Date;

  @DeleteDateColumn()
  @Field(() => Date, { nullable: true })
  deletedAt: Date;

  @JoinColumn()
  @OneToOne(() => Question, { nullable: true })
  @Field(() => Question, { nullable: true })
  question: Question;
}
