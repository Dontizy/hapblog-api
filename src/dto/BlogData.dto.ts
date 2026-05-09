import { Types } from "mongoose"

export interface CreateBlogDTO{
    title:string;
    content:string;
    author:Types.ObjectId;
    imageUrl?:string
}