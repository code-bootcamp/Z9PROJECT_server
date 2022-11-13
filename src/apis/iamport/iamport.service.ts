import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class IamportService {
  private getAccessToken = async () => {
    //LOGGING
    console.log(new Date(), ' | IamportService.getAccessToken()');

    return await axios.post('https://api.iamport.kr/users/getToken', {
      imp_key: process.env.IAMPORT_REST_API_KEY,
      imp_secret: process.env.IAMPORT_REST_API_SECRET,
    });
  };

  async validatePayment({ impUid }) {
    //LOGGING
    console.log(new Date(), ' | IamportService.validatePayment()');

    // get access token from iamport
    const { data: accessTokenData } = await this.getAccessToken();

    // get payment data from iamport
    const { data: paymentData } = await axios
      .get(`https://api.iamport.kr/payments/${impUid}`, {
        headers: {
          Authorization: `Bearer ${accessTokenData.response.access_token}`,
        },
      })
      .catch((error) => {
        throw new UnprocessableEntityException(
          `${error.code} :  ${error.response.data.message}`,
        );
      });
    if (paymentData.code !== 0)
      throw new UnprocessableEntityException(paymentData.message);
    else {
      //LOGGING
      console.log(`${new Date()} | Payment Validated : ${impUid}`);
      return paymentData;
    }
  }

  async refundPayment({ impUid, amount }) {
    //LOGGING
    console.log(new Date(), ' | IamportService.refundPayment()');

    // get access token from iamport
    const { data: accessTokenData } = await this.getAccessToken();

    // get payment data from iamport
    const { data: paymentData } = await axios
      .post(
        `https://api.iamport.kr/payments/cancel?_token=${accessTokenData.response.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${accessTokenData.response.access_token}`,
          },
          imp_uid: impUid,
          amount,
          checksum: amount,
        },
      )
      .catch((error) => {
        throw new UnprocessableEntityException(
          `${error.code} :  ${error.response.data.message}`,
        );
      });

    if (paymentData.code !== 0)
      throw new UnprocessableEntityException(paymentData.message);
    //LOGGING
    console.log(`${new Date()} | Payment Refunded : ${impUid}`);
    return paymentData;
  }
}
