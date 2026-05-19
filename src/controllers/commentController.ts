import type {Request, Response} from "express";
import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";
import {AppError} from "../utils/AppError.js";
import User from "../models/User.js"
import Blog from "../models/Blog.js"
import Comment from "../models/Comment.js"




export const createComment=asyncHandler(async(req:Request, res:Response)=>{
  const {body} = req.body
  const {id} = req.params as {id:string}
  
  if(!body?.trim()){
    throw new AppError("Comment body can't be empty", 400)
  }
  const userId = req.user?._id
  if(!mongoose.isValidObjectId(userId)){
    throw new AppError("Invalid user ID", 400)
  }
  
  if(!mongoose.isValidObjectId(id)){
    throw new AppError("Invalid blog ID")
  }
  
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
