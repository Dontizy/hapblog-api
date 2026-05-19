import { Request, Response, NextFunction } from 'express';
import Blog from '../models/Blog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import mongoose from 'mongoose';

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