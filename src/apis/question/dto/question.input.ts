import { Field, InputType } from '@nestjs/graphql';
import { QUESTION_STATUS_TYPE_ENUM } from '../entities/question.entity';

@InputType()
export class QuestionInput {
  @Field(() => String, {
    nullable: true,
    description: '',
  })
  question: string;

  @Field(() => QUESTION_STATUS_TYPE_ENUM, {
    description: 'question status are PROGESS & SOLVED.',
    defaultValue: QUESTION_STATUS_TYPE_ENUM.PROGRESS,
  })
  status: QUESTION_STATUS_TYPE_ENUM;
}
