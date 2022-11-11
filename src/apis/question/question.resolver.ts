import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { QuestionInput } from './dto/question.input';
import { Question } from './entities/question.entity';
import { IContext } from 'src/common/types/context';

@Resolver()
export class QuestionResolver {
  constructor(
    private readonly questionService: QuestionService, //
  ) {}

  @Mutation(() => Question, { description: 'question signup' })
  createQuestion(
    @Args('questionInput') questionInput: QuestionInput, //
    @Args('productId') productId: string,
    @Context() context: IContext,
  ) {
    const user = context.req.user;
    return this.questionService.create({
      questionInput,
      email: user.email,
      productId,
    });
  }
}
