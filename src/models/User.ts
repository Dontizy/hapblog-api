import mongoose, {Document, Schema, model, HydratedDocument, Types} from "mongoose";
import Blog from "./Blog.js"

export interface IUser {
    name:string;
    email:string;
    role:'user' | 'admin';
    avatar?:string;
    bio?:string;
    avatarPublicId?:string;
    password:string;
    bookmarks: Types.ObjectId[];
    followers: Types.ObjectId[];
    following: Types.ObjectId[];
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
    bio:{
      type:String,
      required:false,
      trim:true,
      maxlength:200,
      default:"This user hasn't added a bio yet. Check out their latest posts to learn more."

    },
    followers:
      {
        type:[Schema.Types.ObjectId],
        ref:"User",
        default:[]
      },

    following:
      {
        type:[Schema.Types.ObjectId],
        ref:"User",
        default:[]
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