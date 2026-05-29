import mongoose, {Document, Schema, model, HydratedDocument, Types} from "mongoose";
import Blog from "./Blog.js"

export interface IUser {
    name:string;
    email:string;
    role:'user' | 'admin';
    avatar?:string;
    avatarPublicId?:string;
    password:string;
    bookmarks: Types.ObjectId[];
    resetPasswordToken?: string | undefined;
    resetPasswordExpire?: Date | undefined;
  
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
    },
    bookmarks: [
  {
    type: Schema.Types.ObjectId,
    ref: "Blog",
  },
],
    resetPasswordToken:{
      type:String,
      select:false
    },
    resetPasswordExpire:{
      type:Date,
      select:false
    }
},{
    timestamps:true
})



export const User = model<IUser>('User', userSchema)
export default User