import { Types } from 'mongoose';

export interface ICurrentUser {
  _id?: Types.ObjectId;
  fullName: string;
  email: string;
}
