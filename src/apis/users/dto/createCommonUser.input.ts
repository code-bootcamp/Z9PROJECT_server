import { InputType, OmitType } from '@nestjs/graphql';
import { CreateUserInput } from './createUser.input';

@InputType()
export class CreateCommonUserInput extends OmitType(
  CreateUserInput,
  [
    'snsLink',
    'snsType',
    'isValidCreator',
    'userType',
    'influencerId',
    'followerNumber',
  ],
  InputType,
) {}
