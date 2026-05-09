import  { HydratedDocument, Schema, Types, model} from "mongoose";

export interface IBlog{
    title:string;
    content:string;
    imageUrl?:string;
    author:Types.ObjectId;
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
     author:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
     }
},{
    timestamps:true
})

const Blog = model("Blog", blogSchema)

export default Blog;
