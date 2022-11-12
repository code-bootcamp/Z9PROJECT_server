import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Product } from 'src/apis/product/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SNS_TYPE_ENUM {
  YOUTUBE = 'YOUTUBE',
  INSTAGRAM = 'INSTAGRAM',
}

export enum USER_TYPE_ENUM {
  COMMON_USER = 'COMMON_USER',
  CREATOR = 'CREATOR',
}

// enum타입을 graphql에 등록
registerEnumType(SNS_TYPE_ENUM, {
  name: 'SNS_TYPE_ENUM',
});

registerEnumType(USER_TYPE_ENUM, {
  name: 'USER_TYPE_ENUM',
});

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String, { nullable: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: USER_TYPE_ENUM,
    default: USER_TYPE_ENUM.COMMON_USER,
  })
  @Field(() => USER_TYPE_ENUM, { nullable: true })
  userType: USER_TYPE_ENUM;

  @Column()
  @Field(() => String, { nullable: true })
  nickname: string;

  @Column()
  @Field(() => String, { nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  zipcode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Field(() => String, { nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Field(() => String, { nullable: true })
  addressDetail: string;

  @Column({ nullable: true })
  @Field(() => String, {
    nullable: true,
    description: 'Need Img URL to be saved',
  })
  profileImg: string;

  @Column({ nullable: true })
  @Field(() => String, {
    nullable: true,
    description: 'Need Img URL to be saved',
  })
  creatorAuthImg: string;

  @Column({ nullable: false, default: false })
  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isAuthedCreator: boolean;

  @Column({ nullable: true })
  @Field(() => String, {
    nullable: true,
    description: 'YOUTUBE ChannelName or INSTA Name',
  })
  snsName: string;

  @Column({ type: 'enum', enum: SNS_TYPE_ENUM, nullable: true })
  @Field(() => SNS_TYPE_ENUM, {
    nullable: true,
    description: 'YOUTUBE or INSTAGRAM',
  })
  snsChannel: string;

  @Column({ default: 0 })
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  followerNumber: number;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true, defaultValue: '' })
  mainContents: string;

  @Column({ type: 'text', nullable: true })
  @Field(() => String, { nullable: true, defaultValue: '' })
  introduce: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true, defaultValue: '' })
  bank: string;

  @Column({ nullable: true })
  @Field(() => String, {
    nullable: true,
    defaultValue: '',
    description: 'Account Number',
  })
  account: string;

  @Column({ nullable: true })
  @Field(() => String, {
    nullable: true,
    defaultValue: '',
    description: 'Account Owner Name (only Creator)',
  })
  accountName: string;

  @Column({ default: 0 })
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  point: number;

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
