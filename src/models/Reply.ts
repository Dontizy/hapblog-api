import {Types,Document,Schema, model, HydratedDocument} from "mongoose";

export interface IReply{
  author:Types.ObjectId;
  body:string;
  createdAt:Date;
  updatedAt:Date;
}

