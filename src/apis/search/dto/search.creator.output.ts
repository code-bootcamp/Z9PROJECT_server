import { Field, ObjectType, OmitType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class SearchCreatorOutput extends OmitType(
  User,
  [
    // 'deletedAt', //
    'updatedAt',
  ],
  ObjectType,
) {}
