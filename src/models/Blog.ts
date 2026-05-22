import  { HydratedDocument, Schema, Types, model} from "mongoose";
import {Comment} from "./Comment.js"
import type {CallbackWithoutResultAndOptionalError} from "mongoose";

export interface IBlog{
    title:string;
    content:string;
    imageUrl?:string;
    author:Types.ObjectId;
    likes:Types.ObjectId[],
    createdAt:Date;
    updatedAt:Date;
}

export type BlogDocument = HydratedDocument<IBlog>;

const blogSchema = new Schema<IBlog>({
     title:{
        type: String,
        required: [true, "Enter title for the blog post"],
        trim: true
     },

     content:{
        type: String,
        required: [true, "Content can't be empty!"]
     },
     imageUrl:{
        type:String,
        required:false,
     },
     likes: [
  {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
],
     author:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
     }
},{
    timestamps:true,
    versionKey: false,
    toJSON:{ virtuals:true },
    toObject:{virtuals:true},
    
})


blogSchema.virtual("commentsCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "blog",
  count: true,
});

blogSchema.virtual("likesCount").get(function () {
  return this.likes.length;
});

const Blog = model("Blog", blogSchema)
export default Blog;
