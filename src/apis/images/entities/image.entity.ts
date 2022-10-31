import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from 'src/apis/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Image {
  @PrimaryColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  imageUrl: string;

  @Column()
  @Field(() => Boolean, { defaultValue: false })
  isMain: boolean;

  @Column()
  @Field(() => Boolean, { defaultValue: false })
  isContents: boolean;

  @Column()
  @Field(() => Int, { nullable: true })
  contentsOrder: number;

  @ManyToOne(() => User)
  userId: User;
}
