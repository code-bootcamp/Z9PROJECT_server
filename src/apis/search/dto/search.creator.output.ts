import { Field, ObjectType, OmitType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class SearchCreatorOutput extends OmitType(
  User,
  ['updatedAt', 'deletedAt', 'createdAt'],
  ObjectType,
) {
  @Field(() => String, { nullable: true })
  createdAt: string;

  @Field(() => String, { nullable: true })
  deletedAt: string;
}
