import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Image {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Field(() => String)
  imageUrl: string;

  @Column({ type: 'varchar', length: 255 })
  @Field(() => String)
  fileName: string;

  @Column({ type: 'tinyint', default: 0 })
  @Field(() => Boolean, { defaultValue: false })
  isMain: boolean;

  @Column({ type: 'tinyint', default: 0 })
  @Field(() => Boolean, { defaultValue: false })
  isContents: boolean;

  @Column({ type: 'int' })
  @Field(() => Int, { nullable: true })
  contentsOrder: number;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @DeleteDateColumn()
  @Field(() => Date, { nullable: true })
  deletedAt: Date;

  @ManyToOne(() => User)
  user: User;
}
