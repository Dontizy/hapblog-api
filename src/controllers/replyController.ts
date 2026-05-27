import type { Request, Response } from "express"
import Reply from "../models/Reply.js"
import Comment from "../models/Comment.js"
import {AppError} from "../utils/AppError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import mongoose from "mongoose"

export const createReply = asyncHandler(async(req:Request, res:Response)=>{
  const {commentId} = req.params as { commentId:string}
  
  if(!mongoose.isValidObjectId(commentId)){
      throw new AppError("Invalid comment ID", 400)
  }
   const comment = await Comment.findById(commentId)
   if(!comment){
     throw new AppError("Comment not found!", 404)
   }
   const {body} = req.body as { body: string }
   
   if(!body?.trim()){
     throw new AppError("Reply is required", 400)
   }
  const user = req.user;
  if(!user){
    throw new AppError("Not authorized", 401)
  }
  const userId = user._id
   const reply = await Reply.create({ author:userId, comment:comment._id, body:body.trim() })
  return res.status(201).json({
    success:true,
    message:"Reply sent successfully",
    reply
  })
})

export const updateReply = asyncHandler(async(req:Request, res:Response)=>{
  const {id, replyId} = req.params as { id:string; replyId:string; }
  const { body } = req.body as { body:string}
  if(!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(replyId)){
    throw new AppError("Invalid comment or reply id", 400)
  }
  if(!body?.trim()){
    throw new AppError("Reply body is required", 400)
  }
  
  const comment = await Comment.exists({_id:id})
  
  if(!comment){
    throw new AppError("Comment not found", 404)
  }
  
  const reply = await Reply.findOne({_id:replyId, comment:id})
  
  if(!reply){
    throw new AppError("Reply not found", 404)
  }
  reply.body = body.trim()
  await reply.save()
  return res.status(200).json({
    success:true,
    message:"Reply updated successfully",
    reply
  })
})

export const deleteReply = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, replyId } = req.params as {
      id: string;
      replyId: string;
    };

    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(replyId)
    ) {
      throw new AppError("Invalid comment or reply ID", 400);
    }

    const comment = await Comment.exists({_id:id});

    if (!comment) {
      throw new AppError("Comment not found", 404);
    }

    const reply = await Reply.findOne({
      _id: replyId,
      comment: id,
    });

    if (!reply) {
      throw new AppError("Reply not found", 404);
    }

    await reply.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Reply deleted successfully",
    });
  }
);

export const toggleReplyLike = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, replyId } = req.params as {
      id: string;
      replyId: string;
    };

    const userId = req.user?._id;

    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(replyId)
    ) {
      throw new AppError("Invalid comment or reply ID", 400);
    }

    const reply = await Reply.findOne({
      _id: replyId,
      comment: id,
    });

    if (!reply) {
      throw new AppError("Reply not found", 404);
    }

    const hasLiked = reply.likes.some(
      (like) => like.toString() === userId?.toString()
    );

    await Reply.findByIdAndUpdate(replyId, {
      [hasLiked ? "$pull" : "$addToSet"]: {
        likes: userId,
      },
    });

    return res.status(200).json({
      success: true,
      liked: !hasLiked,
      message: hasLiked
        ? "Reply unliked successfully"
        : "Reply liked successfully",
    });
  }
);


