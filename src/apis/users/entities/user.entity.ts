import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
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
  @Field(() => String, { nullable: true })
  id: string;

  @Column()
  @Field(() => String, { nullable: true })
  email: string;

  @Column()
  password: string;

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

  /** YouTube ChannelName or Instagram Name */
  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  snsName: string;

  // YOUTUBE or INSTAGRAM
  @Column({ type: 'enum', enum: SNS_TYPE_ENUM, nullable: true })
  @Field(() => SNS_TYPE_ENUM, { nullable: true })
  snsChannel: string;

  @Column({ default: false })
  @Field(() => Boolean, { nullable: true })
  isAuthedCreator: boolean;

  @Column({ default: 0 })
  @Field(() => Int, { nullable: true })
  followerNumber: number;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  mainContents: string;

  @Column({ type: 'text', nullable: true })
  @Field(() => String, { nullable: true })
  introduce: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  bank: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  account: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  accountName: string;

  @Column({ default: 0 })
  @Field(() => Int, { nullable: true })
  point: number;

  @Column({
    type: 'enum',
    enum: USER_TYPE_ENUM,
    default: USER_TYPE_ENUM.COMMON_USER,
  })
  @Field(() => USER_TYPE_ENUM, { nullable: true })
  userType: USER_TYPE_ENUM;

  @CreateDateColumn()
  @Field(() => Date, { nullable: true })
  createdAt: Date;
}
