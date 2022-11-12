import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { IContext } from 'src/common/types/context';
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
    //LOGGING
    console.log('API Create Question Requested');

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
    //LOGGING
    console.log('API Fetch Question Requested');

    const result = await this.questionService.findOne({ questionId });
    return result;
  }

  @Query(() => [Question], {
    description: ' fetching Questions',
    name: 'fetchQuestions',
  })
  async fetchQuestions() {
    //LOGGING
    console.log('API Fetch Questions Requested');

    return await this.questionService.findAll();
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Question)
  updateQuestion(
    @Args('questionId') questionId: string,
    @Args('updateQuestionInput') updateQuestionInput: UpdateQuestionInput, //
  ) {
    //LOGGING
    console.log('API Update Question Requested');

    return this.questionService.update({ questionId, updateQuestionInput });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  deleteQuestion(@Args('questionId') questionId: string) {
    //LOGGING
    console.log('API Delete Question Requested');

    return this.questionService.remove({ questionId });
  }
}
