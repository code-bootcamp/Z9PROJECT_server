import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { IContext } from 'src/common/types/context';
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

    const result = await this.answerSerivce.create({
      createAnswerInput,
      question,
    });
    return result;
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
  ) {
    return this.answerSerivce.update({ answerId, updateAnswerInput });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  deleteAnswer(
    @Args('answerId') answerId: string, //
  ) {
    return this.answerSerivce.remove({ answerId });
  }
}
