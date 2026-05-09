import Blog from "../models/Blog.js";

 export type blogCreateType = {
    title:string;
    content:string;
}

export type updateBlogType = {
     title?:string;
     content?:string;
}
