import mongoose, {Document, Schema, model, HydratedDocument} from "mongoose";
import type {CallbackWithoutResultAndOptionalError} from "mongoose";
import Blog from "./Blog.js"


export interface IUser {
    name:string;
    email:string;
    role:'user' | 'admin';
    avatar?:string;
    avatarPublicId?:string;
    password:string;
  
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>({
    name:{
        type:String,
        required:[true, "Please add name!"]
    },
    email:{
        type:String,
        required:[true, "Please add an email"],
        unique:true,
        trim:true,
        lowercase:true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:'user'
    },
    avatar:{
      type:String,
      required:false,
      default:"https://res.cloudinary.com/dxdtdqxse/image/upload/v1778510804/ChatGPT_Image_May_11_2026_03_45_21_PM_zxd9oh.png"
    },
    avatarPublicId: {
      type: String,
    },
    password:{
        type:String,
        required:[true, "Please enter your password"],
        trim:true,
        minlength:5,
        select:false
    }
},{
    timestamps:true
})

userSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (this: UserDocument, next:CallbackWithoutResultAndOptionalError) {
    const blogs = await Blog.find({
      author: this._id,
    });

    for (const blog of blogs) {
      await blog.deleteOne();
    }

    next();
  }
);
export const User = model<IUser>('User', userSchema)
export default User