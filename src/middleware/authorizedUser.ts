import { Request, Response, NextFunction } from 'express';
import Blog from '../models/Blog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import mongoose from 'mongoose';

export const isAuthor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string }
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError('Invalid blog id', 400)
    }
    const blog = await Blog.findById(id)
    if (!blog) {
        throw new AppError('Post not found', 404)
    }
    const user = req.user?._id
    if (!user) {
        throw new AppError('Not authorized', 401)
    }
    if (String(blog.author) !== String(user)) {
        throw new AppError('Action denied, only author and admin allowed', 403)
    }
    next()
})