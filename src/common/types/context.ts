export interface IUser {
  user?: {
    id: string;
    loginId: string;
  };
}

export interface IContext {
  req: Request & IUser;
  res: Response;
}
