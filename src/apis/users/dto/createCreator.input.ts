import { InputType, OmitType } from '@nestjs/graphql';
import { CreateUserInput } from './createUser.input';

@InputType()
export class CreateCreatorInput extends OmitType(
  CreateUserInput,
  ['address', 'addressDetail', 'zipcode', 'userType'],
  InputType,
) {}
