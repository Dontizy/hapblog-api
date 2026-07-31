import Blog from "../models/Blog.js";
import type { BlogCategory } from "./blogCategory.js";

 export type blogCreateType = {
    title:string;
    category:BlogCategory;
    content:string;
}

export type updateBlogType = {
     title?:string;
     content?:string;
     category?:BlogCategory;
}
