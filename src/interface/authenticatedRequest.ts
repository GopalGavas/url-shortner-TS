import { Request } from "express";
import { IUser } from "../models/user.model";

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}
