import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { IContext } from 'src/common/types/context';
import { UpdateQuestionInput } from '../question/dto/updateQuestion.input';
import { QUESTION_STATUS_TYPE_ENUM } from '../question/entities/question.entity';
import { QuestionService } from '../question/question.service';
import { USER_TYPE_ENUM } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AnswerService } from './answer.service';
import { CreateAnswerInput } from './dto/createAnswer.input';
import { UpdateAnswerInput } from './dto/updateAnswer.input';
import { Answer } from './entites/answer.entity';

@Resolver()
export class AnswerResolver {
  constructor(
    private readonly answerSerivce: AnswerService, //

    private readonly usersService: UsersService,

    private readonly questionService: QuestionService,
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Answer, { description: 'answer signup' })
  async createAnswer(
    @Args('questionId') questionId: string,
    @Args('createAnswerInput') createAnswerInput: CreateAnswerInput, //
    @Context() context: IContext,
  ) {
    const user = context.req.user;

    const findUser = await this.usersService.findOneByUserId(user.id);

    if (findUser.userType !== USER_TYPE_ENUM.CREATOR)
      throw new NotFoundException('크리에이터가 아닙니다.');
    const question = await this.questionService.findOne({ questionId });
    const answer = await this.answerSerivce.create({
      createAnswerInput,
      question,
    });
    const updateQuestionInput: UpdateQuestionInput = {
      status: QUESTION_STATUS_TYPE_ENUM.SOLVED,
      answerId: answer.id,
    };
    await this.questionService.update({
      questionId,
      updateQuestionInput,
    });
    return answer;
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Answer])
  async fetchLoginUserAnswer(
    @Args('questionId') questionId: string, //
  ) {
    return this.answerSerivce.findAllByQuestion({ questionId });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Answer)
  updateAnswer(
    @Args('answerId') answerId: string,
    @Args('updateAnswerInput') updateAnswerInput: UpdateAnswerInput, //
    @Context() ctx: IContext,
  ) {
    return this.answerSerivce.update({
      answerId,
      updateAnswerInput,
      userId: ctx.req.user.id,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  deleteAnswer(
    @Args('answerId') answerId: string, //
    @Context() ctx: IContext,
  ) {
    return this.answerSerivce.remove({
      answerId, //
      userId: ctx.req.user.id,
    });
  }
}
