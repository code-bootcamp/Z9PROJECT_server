import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { QuestionService } from './question.service';

import { Question } from './entities/question.entity';
import { IContext } from 'src/common/types/context';
import { CreateQuestionInput } from './dto/createQuestion.input';

@Resolver()
export class QuestionResolver {
  constructor(
    private readonly questionService: QuestionService, //
  ) {}

  @Mutation(() => Question, { description: 'question signup' })
  createQuestion(
    @Args('createQuestionInput') createQuestionInput: CreateQuestionInput, //
    @Args('productId') productId: string,
    @Context() context: IContext,
  ) {
    const user = context.req.user;
    return this.questionService.create({
      createQuestionInput,
      email: user.email,
      productId,
    });
  }
}
