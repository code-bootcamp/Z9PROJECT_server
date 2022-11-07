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
  INFLUENCER = 'INFLUENCER',
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
  @Field(() => String)
  email: string;

  @Column()
  loginPassword: string;

  @Column()
  @Field(() => String)
  nickName: string;

  @Column()
  @Field(() => String, { nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Field(() => String, { nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Field(() => String, { nullable: true })
  addressDetail: string;

  /** YouTube ChannelName or Instagram Name */
  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  instaNameOrYTubeChannel: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  name: string;

  @Column({ type: 'enum', enum: SNS_TYPE_ENUM, nullable: true })
  @Field(() => SNS_TYPE_ENUM, { nullable: true })
  snsType: string;

  @Column({ default: false })
  @Field(() => Boolean, { nullable: true })
  isAuthedInfluencer: boolean;

  @Column({ default: 0 })
  @Field(() => Int, { nullable: true })
  followerNumber: number;

  @Column({ nullable: true })
  @Field(() => String)
  mainContentName: string;

  @Column({ type: 'text', nullable: true })
  @Field(() => String, { nullable: true })
  aboutInfluencer: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  bankName: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  bankAccountNumber: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  accountOwnerName: string;

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
