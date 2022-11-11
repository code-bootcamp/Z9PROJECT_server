import { InputType, PartialType } from '@nestjs/graphql';
import { CreateQuestionInput } from './createQuestion.input';

@InputType()
export class UpdateQuestionInput extends PartialType(CreateQuestionInput) {}
