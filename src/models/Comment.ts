import {Types,Schema, model, HydratedDocument} from "mongoose";

export interface IComment{
  author:Types.ObjectId;
  blog:Types.ObjectId;
  body:string;
  createdAt:Date;
  updatedAt:Date;
}

export type CommentDocument =HydratedDocument<IComment> 

export const commentSchema = new Schema<IComment>({
  author:{
    type:Schema.Types.ObjectId,
    required:true,
    ref:"User",
    index:true
  },
  body:{
    type:String,
    required:[true, "Comment body can't be empty"],
    trim:true
  },
  blog:{
    type:Schema.Types.ObjectId,
    required:true,
    ref:"Blog",
    index:true
  }
},{
  timestamps:true
  })
  
  export const Comment = model<IComment>("Comment", commentSchema)
  export default Comment;