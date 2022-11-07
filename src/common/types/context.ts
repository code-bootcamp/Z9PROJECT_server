export interface IUser {
  user?: {
    userId: string;
    loginId: string;
    id: string;
  };
  id: string;
  loginId: string;
}

export interface IContext {
  req: Request & IUser;
  res: Response;
}
