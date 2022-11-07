import { InputType, OmitType } from '@nestjs/graphql';
import { CreateUserInput } from './createUser.input';

@InputType()
export class CreateCommonUserInput extends OmitType(
  CreateUserInput,
  [
    'instaNameOrYTubeChannel',
    'name',
    'snsType',
    'isAuthedInfluencer',
    'followerNumber',
    'influencerAuthImg',
    'mainContentName',
    'aboutInfluencer',
    'bankName',
    'bankAccountNumber',
    'accountOwnerName',
    'userType',
  ],
  InputType,
) {}
