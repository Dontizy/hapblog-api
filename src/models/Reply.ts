import {Types,Document,Schema, model, HydratedDocument} from "mongoose";

export interface IReply{
  author:Types.ObjectId;
  comment:Types.ObjectId;
  body:string;
  likes:Types.ObjectId[];
  createdAt:Date;
  updatedAt:Date;
}

export type ReplyDocument = HydratedDocument<IReply>

export const replySchema = new Schema<IReply>({
  author:{
    type:Schema.Types.ObjectId,
    required:true,
    ref:"User"
  },
  comment:{
    type:Schema.Types.ObjectId,
    required:true,
    ref:"Comment"
  },
  likes:[{
    type:Schema.Types.ObjectId,
    ref:"User",
    default:[]
  }],
  body:{
      type:String,
      required:[true, "Reply body is required"],
      trim:true
    }
},{
  timestamps:true,
  versionKey: false,
  toJSON:{ virtuals:true },
  toObject:{virtuals:true},
  })
  
replySchema.virtual("likesCount").get(function () {
   return this.likes?.length || 0;
});


export const Reply = model<IReply>("Reply", replySchema)
export default Reply