import mongoose, {Document, Schema, model, HydratedDocument} from "mongoose";

export interface IUser {
    name:string;
    email:string;
    role:'user' | 'admin'
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

export const User = model<IUser>('User', userSchema)
export default User