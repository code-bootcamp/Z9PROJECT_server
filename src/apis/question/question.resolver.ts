import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { CreateQuestionInput } from './dto/createQuestion.input';
import { Question } from './entities/question.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { UpdateQuestionInput } from './dto/updateQuestion.input';

@Resolver()
export class QuestionResolver {
  constructor(
    private readonly questionService: QuestionService, //
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Question, { description: 'question signup' })
  async createQuestion(
    @Args('createQuestionInput') createQuestionInput: CreateQuestionInput, //
  ) {
    const result = await this.questionService.create({
      createQuestionInput,
    });
    return result;
  }

  @Query(() => Question, {
    description: 'fetching Question',
    name: 'fetchQuestion',
  })
  async fetchQuestion(@Args('questionId') questionId: string) {
    const result = await this.questionService.findOne({ questionId });
    return result;
  }

  @Query(() => [Question], {
    description: ' fetching Questions',
    name: 'fetchQuestions',
  })
  async fetchQuestions() {
    return await this.questionService.findAll();
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Question)
  updateQuestion(
    @Args('questionId') questionId: string,
    @Args('updateQuestionInput') updateQuestionInput: UpdateQuestionInput, //
  ) {
    return this.questionService.update({ questionId, updateQuestionInput });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  deleteQuestion(@Args('questionId') questionId: string) {
    return this.questionService.remove({ questionId });
  }
}
