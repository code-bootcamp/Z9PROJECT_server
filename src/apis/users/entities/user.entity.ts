import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum SNS_TYPE_ENUN {
  YOUTUBE = 'youtube',
  INSTAGRAM = 'instagram',
}

export enum USER_TYPE_ENUM {
  COMMON_USER = 'commonUser',
  CREATOR = 'creator',
}

// enum타입을 graphql에 등록
registerEnumType(SNS_TYPE_ENUN, {
  name: 'SNS_TYPE_ENUN',
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
  loginId: string;

  @Column()
  loginPassword: string;

  @Column()
  @Field(() => String, { nullable: true })
  name: string;

  @Column()
  @Field(() => String, { nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Field(() => String, { nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Field(() => String, { nullable: true })
  addressDetail: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  @Field(() => String, { nullable: true })
  snsLink: string;

  @Column({ type: 'enum', enum: SNS_TYPE_ENUN, nullable: true })
  @Field(() => SNS_TYPE_ENUN, { nullable: true })
  snsType: SNS_TYPE_ENUN;

  @Column({ default: false })
  @Field(() => Boolean, { nullable: true })
  isValidCreator: boolean;

  @Column({
    type: 'enum',
    enum: USER_TYPE_ENUM,
    default: USER_TYPE_ENUM.COMMON_USER,
  })
  @Field(() => USER_TYPE_ENUM, { nullable: true })
  userType: USER_TYPE_ENUM;
}
