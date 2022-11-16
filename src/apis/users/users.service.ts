import { CreateCommonUserInput } from './dto/createCommonUser.input';
import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
  CACHE_MANAGER,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserInput } from './dto/createUser.input';
import { User, USER_TYPE_ENUM } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { ISmsToken, SMS_TOKEN_KEY_PREFIX } from 'src/common/types/auth.types';
import { CreateCreatorInput } from './dto/createCreator.input';
import axios from 'axios';
import { PointsService } from '../points/points.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private readonly encryptPassword = async (inputPassword): Promise<string> => {
    //LOGGING
    console.log(new Date(), ' | UsersService.encryptPassword()');

    return await bcrypt.hash(inputPassword, parseInt(process.env.BCRYPT_SALT));
  };

  async findAllCreator() {
    //LOGGING
    console.log(new Date(), ' | UsersService.findAllCreator()');

    return await this.usersRepository
      .createQueryBuilder('user')
      .where('user.userType = :userType', { userType: USER_TYPE_ENUM.CREATOR })
      .getMany();
  }

  async findOneByUserId(userId) {
    //LOGGING
    console.log(new Date(), ' | UsersService.findOneByUserId()');

    return this.usersRepository.findOne({ where: { id: userId } });
  }

  async findOneByEmail(email) {
    //LOGGING
    console.log(new Date(), ' | UsersService.findOneByEmail()');

    return this.usersRepository.findOne({ where: { email } });
  }

  async findOneByNickName(nickname) {
    //LOGGING
    console.log(new Date(), ' | UsersService.findOneByNickName()');

    return this.usersRepository.findOne({ where: { nickname } });
  }

  async isSameLoginPassword(userId, password) {
    //LOGGING
    console.log(new Date(), ' | UsersService.isSameLoginPassword()');

    const user = await this.findOneByUserId(userId);
    return await bcrypt.compare(password, user.password);
  }

  private async checkSmsAuth(phoneNumber: string, signupId: string) {
    //LOGGING
    console.log(new Date(), ' | UsersService.checkSmsAuth()');

    const smsToken: ISmsToken = await this.cacheManager.get(
      SMS_TOKEN_KEY_PREFIX + phoneNumber,
    );

    if (!smsToken || !smsToken?.isAuth || smsToken?.signupId !== signupId)
      return false;

    await this.cacheManager.del(SMS_TOKEN_KEY_PREFIX + phoneNumber);

    return true;
  }

  async checkUserBeforeCreate(
    signupId: string,
    createUserInput:
      | CreateUserInput
      | CreateCommonUserInput
      | CreateCreatorInput,
  ) {
    //LOGGING
    console.log(new Date(), ' | UsersService.checkUserBeforeCreate()');

    const user = await this.usersRepository.findOne({
      where: { email: createUserInput.email },
    });
    if (user) throw new ConflictException('이미 등록된 아이디입니다.');

    const isValidSmsAuth = await this.checkSmsAuth(
      createUserInput.phoneNumber,
      signupId,
    );
    if (!isValidSmsAuth) {
      throw new UnprocessableEntityException(
        '핸드폰 번호가 인증되지 않았거나 존재하지 않습니다',
      );
    }
  }
  async getYoutubeInfo({ chennelId }) {
    //LOGGING
    console.log(new Date(), ' | UsersService.getYoutubeInfo()');

    const { data } = await axios.get(
      'https://www.googleapis.com/youtube/v3/channels',
      {
        params: {
          part: 'snippet,statistics',
          id: chennelId,
          key: process.env.YOUTUBE_API_KEY,
          fields:
            'items(snippet(title, description),statistics(viewCount,subscriberCount,videoCount,hiddenSubscriberCount))',
        },
      },
    );

    return data;
  }

  async createUserInFinalStep(
    createUserInput:
      | CreateUserInput
      | CreateCommonUserInput
      | CreateCreatorInput,
  ) {
    //LOGGING
    console.log(new Date(), ' | UsersService.createUserInFinalStep()');

    createUserInput.password = await this.encryptPassword(
      createUserInput.password,
    );
    return await this.usersRepository.save(createUserInput);
  }

  async create(
    signupId: string,
    createUserInput:
      | CreateUserInput
      | CreateCommonUserInput
      | CreateCreatorInput,
  ) {
    //LOGGING
    console.log(new Date(), ' | UsersService.create()');

    await this.checkUserBeforeCreate(signupId, createUserInput);

    createUserInput.password = await this.encryptPassword(
      createUserInput.password,
    );

    return await this.createUserInFinalStep(createUserInput);
  }

  async createUserObj(email: string, nickname: string, profileImg: string) {
    return await this.usersRepository.create({ email, nickname, profileImg });
  }

  async update({ userId, updateUserInput }) {
    //LOGGING
    console.log(new Date(), ' | UsersService.update()');

    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (updateUserInput.password) {
      updateUserInput.password = await this.encryptPassword(
        updateUserInput.password,
      );
    }

    const result = this.usersRepository.save({
      ...user,
      ...updateUserInput,
      userType: user.userType,
      point: user.point,
    });

    return result;
  }

  async delete(userId: string) {
    //LOGGING
    console.log(new Date(), ' | UsersService.delete()');

    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user)
      throw new UnprocessableEntityException(
        '해당 유저 정보를 찾을 수 없습니다.',
      );

    const result = await this.usersRepository.delete({
      id: userId,
    });
    return result.affected ? true : false;
  }
}
