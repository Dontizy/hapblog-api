import { Types } from "mongoose";
import { IUser } from "../models/User.js";

export type PopulatedFollower = Pick<
  IUser,
  "name" | "avatar" | "bio" | "username" 
> & {
  _id: Types.ObjectId;
};


