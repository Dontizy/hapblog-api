import {Types} from "mongoose";

export type createCommentType={
  author:Types.ObjectId;
  blog:Types.ObjectId;
  body:string;
}