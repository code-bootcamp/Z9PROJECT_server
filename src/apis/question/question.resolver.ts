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
    //LOGGING
    console.log(new Date(), ' | API Create Question Requested');

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
    console.log(new Date(), ' | API Fetch Question Requested');

    const result = await this.questionService.findOne({ questionId });
    return result;
  }

  @Query(() => [Question], {
    description: ' fetching Questions',
    name: 'fetchQuestions',
  })
  async fetchQuestions(
    @Args('productId') productId: string, //
  ) {
    //LOGING
    console.log(new Date(), ' | API Fetch Questions Requested');

    return await this.questionService.findAll({ productId });
  }

  // 내 아이디를 기준으로 나한테 달린 질문리스트를 뽑는다.()
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Question], {
    description: 'fetching Questions by creators and commonUsers using userId',
  })
  async fetchMyQuestions(
    @Args('userId') userId: string, //
  ) {
    //LOGGING
    console.log(new Date(), ' | API Fetch My Questions Requested');

    return await this.questionService.findByMyQuestion({ userId });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Question)
  async updateQuestion(
    @Args('questionId') questionId: string,
    @Args('updateQuestionInput') updateQuestionInput: UpdateQuestionInput, //
  ) {
    //LOGGING
    console.log(new Date(), ' | API Update Question Requested');

    await this.questionService.checkUpdate({ questionId });

    return this.questionService.update({ questionId, updateQuestionInput });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  async deleteQuestion(@Args('questionId') questionId: string) {
    //LOGGING
    console.log(new Date(), ' | API Delete Question Requested');

    await this.questionService.checkAnswer({ questionId });

    return this.questionService.remove({ questionId });
  }
}
