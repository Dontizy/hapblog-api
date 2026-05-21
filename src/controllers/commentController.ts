import type {Request, Response} from "express";
import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";
import {AppError} from "../utils/AppError.js";
import User from "../models/User.js"
import Blog from "../models/Blog.js"
import Comment from "../models/Comment.js"
import {createCommentType} from "../types/commentTypes.js"




export const createComment=asyncHandler(async(req:Request<{}, {}, createCommentType>, res:Response)=>{
  const {body} = req.body
  const {id} = req.params as {id:string}
  const user = req.user
  
  if(!body?.trim()){
    throw new AppError("Comment body can't be empty", 400)
  }
  
  if(!mongoose.isValidObjectId(id)){
    throw new AppError("Invalid blog ID", 400)
  }
  if(!user) {
  throw new AppError("Unauthorized", 401)
}
const userId = user._id
  
  const blog = await Blog.findById(id)
  if(!blog){
    throw new AppError("Blog post not found", 404)
  }

  const comment = await Comment.create({
    author:userId,
    blog:blog._id,
    body:body.trim()
  })
  return res.status(201).json({
    success:true,
    message:"Comment created successfully",
    comment
  })
})

export const fetchComments=asyncHandler(async(req:Request, res:Response)=>{
  const {id} = req.params as { id:string }
  if(!mongoose.isValidObjectId(id)){
    throw new AppError("Invalid blog post ID", 400)
  }
  const blog = await Blog.findById(id)
  if(!blog){
    throw new AppError("Blog post not found", 404)
  }
  const comments = await Comment.find({blog:id}).sort({ createdAt: -1 }).populate("author", "name avatar")
  return res.status(200).json({
    success:true,
    comments
  })
})

export const updateComment = asyncHandler(async(req:Request, res:Response)=>{
  const {id,commentId} = req.params as {id:string, commentId:string}
  const {body} = req.body as {body:string}
  if(!mongoose.isValidObjectId(id)){
    throw new AppError("Invalid blog post ID", 400)
  }
  if(!mongoose.isValidObjectId(commentId)){
    throw new AppError("Invalid comment ID", 400)
  }
  if(!body?.trim()){
    throw new AppError("Comment body can't be empty", 400)
  }
  const blog = await Blog.findById(id)
  
  if(!blog){
    throw new AppError("Blog post not found", 404)
  }
  const comment = await Comment.findOne({_id:commentId, blog:id})
  if(!comment){
    throw new AppError("Comment not found", 404)
  }
  comment.body = body.trim()
  await comment.save()
  return res.status(200).json({
    success:true,
    comment,
    message:"Comment updated successfully"
  })
})

export const deleteComment = asyncHandler(async(req:Request, res:Response)=>{
  const {commentId, id} = req.params as { commentId:string, id:string}
  
  if(!mongoose.isValidObjectId(commentId)){
    throw new AppError("Invalid comment ID", 400)
  }
  const blog = await Blog.findById(id)
  if(!blog){
    throw new AppError("Blog post not found", 404)
  }
  const comment = await Comment.findOne({_id:commentId, blog:id
  })
  if(!comment){
    throw new AppError("Comment not found", 404)
  }
  await comment.deleteOne()
  return res.status(200).json({
    success:true,
    message:"Comment deleted successfully"
  })
})

export const toggleLikeComment =asyncHandler(async(req:Request, res:Response)=>{
  const {id, commentId} = req.params as{
    id:string,
    commentId:string
  }
  const user = req.user
  if(!user){
    throw new AppError("Not authorized", 401)
  }
  const userId = user._id
  if(!mongoose.isValidObjectId(id)){
    throw new AppError("Invalid blog post ID", 400)
  }
  if(!mongoose.isValidObjectId(commentId)){
    throw new AppError("Invalid blog comment ID", 400)
  }
  const comment = await Comment.findOne({
    _id:commentId,
    blog:id
  })
  if(!comment){
    throw new AppError("Blog post comment not found", 404)
  }
  const alreadyLiked = comment.likes.some((like)=> like.toString() === userId.toString())
  
  if(alreadyLiked){
   comment.likes = comment.likes.filter((like)=> like.toString() !== userId.toString())
   await comment.save()
   return res.status(200).json({
     success:true,
     message:"Unliked comment"
   })
  }
  
  comment.likes.push(userId)
 await comment.save()
 return res.status(200).json({
   success:true,
   message:"liked comment"
 })
})
