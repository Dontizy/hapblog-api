import { Types } from "mongoose";
import { IUser } from "../models/User.js";

export type PopulatedFollower = Pick<
  IUser,
  "name" | "avatar" | "bio"
> & {
  _id: Types.ObjectId;
};
