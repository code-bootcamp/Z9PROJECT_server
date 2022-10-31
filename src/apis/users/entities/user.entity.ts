import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum SNSTYPE_ENUN {
  YOUTUBE = 'youtube',
  INSTAGRAM = 'instagram',
}

export enum USERTYPE_ENUM {
  COMMON_USER = 'commonUser',
  CREATOR = 'creator',
}

// enum타입을 graphql에 등록
registerEnumType(SNSTYPE_ENUN, {
  name: 'SNSTYPE_ENUN',
});

registerEnumType(USERTYPE_ENUM, {
  name: 'USERTYPE_ENUM',
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

  @Column({ type: 'enum', enum: SNSTYPE_ENUN, nullable: true })
  @Field(() => SNSTYPE_ENUN, { nullable: true })
  snsType: string;

  @Column({ nullable: true })
  @Field(() => Boolean, { nullable: true })
  isValidCreator: boolean;

  @Column({ type: 'enum', enum: USERTYPE_ENUM, nullable: true })
  @Field(() => USERTYPE_ENUM, { nullable: true })
  userType: string;

}