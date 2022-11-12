import { InputType, PartialType } from '@nestjs/graphql';
import { CreateAnswerInput } from './createAnswer.input';

@InputType()
export class UpdateAnswerInput extends PartialType(CreateAnswerInput) {}
