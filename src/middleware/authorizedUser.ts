import { Request, Response, NextFunction } from 'express';
import Blog from '../models/Blog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import mongoose from 'mongoose';
import Comment from "../models/Comment.js"

export const isAuthorized = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string }
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError('Invalid blog post id', 400)
    }
    const blog = await Blog.findById(id)
    if (!blog) {
        throw new AppError('Blog post not found', 404)
    }
    const user = req.user?._id
    if (!user) {
        throw new AppError('Not authorized', 401)
    }
    const role = req.user?.role
    if (String(blog.author) !== String(user) && role !== "admin") {
        throw new AppError('Action denied, only author and admin allowed', 403)
    }
    next()
})

export const isAdmin = asyncHandler(async(req:Request, res:Response, next:NextFunction)=>{
    if(!req.user){
        throw new AppError('Not authorized', 401)
    }
    if(req.user?.role !== "admin"){
         throw new AppError('Action denied, only is admin allowed', 403)
    }
    next();
})

export const isCommentAuthor=asyncHandler(async(req:Request, res:Response, next:NextFunction)=>{
  const {commentId}=req.params as {
    commentId:string
  }
  const userId = req.user?._id
  if(!mongoose.isValidObjectId(commentId)){
    throw new AppError("Invalid comment ID", 400)
  }
  const comment = await Comment.findById(commentId)
  if(!comment){
    throw new AppError("Comment not found", 404)
  }
  if(comment.author.toString() !== userId?.toString()){
    throw new AppError("Permission denied, you are not the author of this comment", 403)
  }
  next()
})

export const isCommentAuthorOrAdmin = asyncHandler(async(req:Request, res:Response, next:NextFunction)=>{
  const {commentId}=req.params as {
    commentId:string
  }
  const userId = req.user?._id
  const role = req.user?.role
  if(!mongoose.isValidObjectId(commentId)){
    throw new AppError("Invalid comment ID", 400)
  }
  const comment = await Comment.findById(commentId)
  if(!comment){
    throw new AppError("Comment not found", 404)
  }
  const isAuthor = comment.author.toString() === userId?.toString();
  const isAdmin = role === "admin"
  if(!isAuthor && !isAdmin){
    throw new AppError("Permission denied, only admin or author is allowed", 403)
  }
  next()
})