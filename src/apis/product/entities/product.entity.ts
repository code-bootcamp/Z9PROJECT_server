import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Min } from 'class-validator';
import { ProductDetail } from 'src/apis/productDetail/entities/productDetail.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PRODUCT_END_TYPE {
  TIME_ONLY = 'TIME_ONLY',
  TOTAL_QTY = 'TOTAL_QTY',
}

// enum타입을 graphql에 등록
registerEnumType(PRODUCT_END_TYPE, {
  name: 'PRODUCT_END_TYPE',
});

@Entity()
@ObjectType()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  @Field(() => String, { nullable: false })
  name: string;

  @Min(0)
  @Column({ type: 'int', nullable: false })
  @Field(() => Number, { nullable: false })
  originPrice: number;

  @Min(0)
  @Column({ type: 'float', nullable: true, default: 0 })
  @Field(() => Number, { nullable: true })
  discountRate: number;

  @Min(0)
  @Column({ type: 'int', nullable: true })
  @Field(() => Number, { nullable: true })
  discountPrice: number;

  @Column({ default: false })
  @Field(() => Boolean)
  isSoldout: boolean;

  @Column({ type: 'varchar', length: 50, nullable: false })
  @Field(() => String, {
    nullable: false,
    description: 'delivery method is one method.',
  })
  delivery: string;

  @Column({ type: 'enum', enum: PRODUCT_END_TYPE, nullable: false })
  @Field(() => PRODUCT_END_TYPE, { nullable: false })
  endType: string;

  @Column({ type: 'datetime', nullable: false })
  @Field(() => Date, { nullable: false })
  validFrom: Date;

  @Column({ type: 'datetime', nullable: false })
  @Field(() => Date, { nullable: false })
  validUntil: Date;

  @Column({ type: 'text', nullable: true })
  @Field(() => [String], { nullable: true })
  images: string[];

  @Column({ type: 'text', nullable: true })
  @Field(() => [String], { nullable: true })
  detailImages: string[];

  @Column({ type: 'text', nullable: true })
  @Field(() => String, { nullable: true })
  content: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  @Field(() => String, { nullable: true })
  option1: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  @Field(() => String, { nullable: true })
  option2: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  @Field(() => String, { nullable: true })
  option3: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  @Field(() => String, { nullable: true })
  option4: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  @Field(() => String, { nullable: true })
  option5: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  @Field(() => String, { nullable: true })
  youtubeLink: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  @Field(() => String, { nullable: false })
  shopName: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  @Field(() => String, { nullable: false })
  ceo: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  @Field(() => String, {
    nullable: false,
    description: 'brn is business_registraion_number',
  })
  brn: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  @Field(() => String, {
    nullable: false,
    description: 'mobn is mail_order_business_number',
  })
  mobn: string;

  @OneToOne(() => ProductDetail, (productDetail) => productDetail.product)
  productDetail: ProductDetail;

  @ManyToOne(() => User)
  user: User;

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
