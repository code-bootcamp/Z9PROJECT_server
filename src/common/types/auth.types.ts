export const SMS_TOKEN_KEY_PREFIX = 'smsToken:';

export interface ISmsToken {
  isAuth: boolean;
  smsToken?: string;
  createUserStepId?: string;
}
