import { UnprocessableEntityException } from '@nestjs/common';
import coolsms from 'coolsms-node-sdk';

export class SmsAuth {
  public static getCorrectPhoneNumber(phoneNumber: string) {
    //LOGGING
    console.log(new Date(), ' | SmsAuth.getCorrectPhoneNumber()');

    const regex = /(^\d{3}-\d{3,4}-\d{4}$)|(^\d{10,11}$)/;
    if (!regex.test(phoneNumber)) {
      console.log(
        new Date(),
        ' | 휴대폰 형식을 제대로 입력해 주세요.',
        phoneNumber,
      );
      throw new UnprocessableEntityException(
        '폰번호 형식을 제대로 입력해 주세요.',
      );
    }

    return phoneNumber.split('-').join('');
  }

  public static getSmsToken(digit = 6) {
    //LOGGING
    console.log(new Date(), ' | SmsAuth.getSmsToken()');

    if (!digit || isNaN(digit)) {
      console.log(new Date(), ' | 자리수를 제대로 입력해 주세요');
      return false;
    }
    if (digit < 2 || digit >= 10) {
      console.log(new Date(), ' | 에러발생! 범위가 너무 작거나 너무 큽니다');
      return false;
    }

    const result = String(Math.floor(Math.random() * 10 ** digit)).padStart(
      digit,
      '0',
    );
    return result;
  }

  public static async sendSmsTokenToPhone(phoneNumber, result) {
    //LOGGING
    console.log(new Date(), ' | SmsAuth.sendSmsTokenToPhone()');

    const SMS_API_KEY = process.env.SMS_API_KEY;
    const SMS_API_SECRET = process.env.SMS_API_SECRET;
    const SMS_SENDER_TEL = process.env.SMS_SENDER_TEL;

    const messageService = new coolsms(SMS_API_KEY, SMS_API_SECRET);
    /** 프론트 연동 점검시 아래 주석 풀고 실제 폰으로 인증번호 받을 것 */
    const response = await messageService.sendOne({
      to: phoneNumber,
      from: SMS_SENDER_TEL,
      text: `[zero9.shop] 안녕하세요. 요청하신 인증번호는 [${result}] 입니다.`,
      autoTypeDetect: true,
    });
    console.log(
      `${new Date()} | ${phoneNumber}번호로 인증번호 ${result}를 전송합니다!!!`,
    );
  }
}
