import {
  ConflictException,
  ConsoleLogger,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository, SimpleConsoleLogger } from 'typeorm';
import {
  PointHistory,
  PAYMENT_STATUS_ENUM,
} from '../pointsHistory/entities/pointHistory.entity';

@Injectable()
export class IamportService {
  constructor(
    @InjectRepository(PointHistory)
    private readonly pointsRepository: Repository<PointHistory>,
  ) {}

  private getAccessToken = async () => {
    return await axios.post('https://api.iamport.kr/users/getToken', {
      imp_key: process.env.IAMPORT_REST_API_KEY,
      imp_secret: process.env.IAMPORT_REST_API_SECRET,
    });
  };

  async validateCreateInput({ impUid, amount, user }) {
    console.log('00:');

    // get access token from iamport
    const { data: accessTokenData } = await this.getAccessToken();
    console.log('01 accessTokenData:', accessTokenData);

    // get payment data from iamport
    // 0. imp_uid로 iamport 서버에 거래내역 조회
    const { data: paymentData } = await axios
      .get(`https://api.iamport.kr/payments/${impUid}`, {
        headers: {
          Authorization: `Bearer ${accessTokenData.response.access_token}`,
        },
      })
      .catch((error) => {
        console.log('아임포트 결제 정보 받기 에러: ', error);
        throw new UnprocessableEntityException(
          '아임포트 결제 정보 받기 에러: ' +
            error.code +
            ': ' +
            error.response.data.message,
        );
      });

    console.log('02 paymentData:', paymentData);
    if (paymentData.code !== 0)
      throw new UnprocessableEntityException(paymentData.message);

    // check if payment is valid
    // 1. 이미 결제된 거래인지 확인 - 지금 시점에서는 결제 정보가 없어야 함.
    // 환불등으로 동일한  imp_uid가 결제 테이블에 쌓이더라도 최초 결제 로직 시점엔 동일한 imp_uid가 있을수 없으므로 ConflictException 발생가능.
    const payment = await this.pointsRepository.findOne({
      where: { impUid },
    });
    if (payment) {
      throw new ConflictException('이미 결제된 거래입니다.');
    }
    // console.log('02 payment:', payment);

    // 2. 조회한 거래내역의 status가 'paid'인지 확인
    if (paymentData.response.status !== PAYMENT_STATUS_ENUM.PAID) {
      throw new UnprocessableEntityException('결제가 완료되지 않았습니다.');
    }

    // 3. 조회한 거래내역의 amount와 결제금액이 일치하는지 확인
    if (paymentData.response.amount !== amount) {
      throw new UnprocessableEntityException('결제금액이 일치하지 않습니다.');
    }

    // 4. 조회한 거래내역의 user.name(실명)와 결제요청한 user.buyer_name가 일치하는지 확인은 적절하지 않음
    // 일단 먼저 실명 인증한 이름을 DB에 저장해야하고, 결제를 로그인한 본인의 카드로만 결제할 수 있게 해야하기 때문.
    // 로그인한 이메일과 결제시 입력한(수정가능) 이메일 체크도 부적절함.
    // if (paymentData.buyer_name !== user.name) {
    //   throw new ConflictException('결제자가 일치하지 않습니다.');
    // }

    // if (user.point < amount) {
    //   throw new ConflictException('잔액이 부족합니다.');
    // }

    return paymentData;
  }

  async validateCancelInput({ impUid, amount, user }) {
    const payments = await this.pointsRepository.find({
      where: { impUid },
    });

    if (!payments)
      throw new UnprocessableEntityException('결제 정보가 없습니다.');
    for (const pay of payments) {
      if (pay.payStatus === PAYMENT_STATUS_ENUM.CANCELLED)
        throw new UnprocessableEntityException('이미 취소된 거래입니다.');
    }

    // get access token from iamport
    const { data: accessTokenData } = await this.getAccessToken();

    // get payment data from iamport
    // 0. imp_uid로 iamport 서버에 거래내역 조회
    const checksum = amount;
    const { data: paymentData } = await axios
      .post(
        `https://api.iamport.kr/payments/cancel?_token=${accessTokenData.response.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${accessTokenData.response.access_token}`,
          },
          imp_uid: impUid,
          amount,
          checksum,
        },
      )
      .catch((error) => {
        console.log('error: ', error);
        throw new UnprocessableEntityException(
          `결제 취소에 실패했습니다.
          ${error.code} :  ${error.response.data.message}
          `,
        );
      });

    if (paymentData.code !== 0)
      throw new UnprocessableEntityException(paymentData.message);

    return payments;
  }
}
