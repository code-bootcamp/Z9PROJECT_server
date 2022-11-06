import { InputType, OmitType } from '@nestjs/graphql';
import { CreateUserInput } from './createUser.input';

@InputType()
export class CreateInfluencerInput extends OmitType(
  CreateUserInput,
  ['address', 'addressDetail', 'userType'],
  InputType,
) {}
