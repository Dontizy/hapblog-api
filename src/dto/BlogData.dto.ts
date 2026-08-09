import { Types } from "mongoose"
import type { BlogCategory } from "../types/blogCategory.js";

export interface CreateBlogDTO{
    title:string;
    content:string;
    category:BlogCategory;
    author:Types.ObjectId;
    status?: "draft" | "published"
    imageUrl?:string
}
