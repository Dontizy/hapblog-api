import type { Request, Response } from "express";
import Blog from "../models/Blog.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { blogCreateType, updateBlogType } from "../types/blogTypes.js";
import { CreateBlogDTO } from "../dto/BlogData.dto.js";
import mongoose from "mongoose";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import { UploadApiResponse } from "cloudinary";


export const createBlogPost = asyncHandler(async (req: Request<{}, {}, blogCreateType>, res: Response) => {

    const { title, content } = req.body

    if (!title || !content) {
        throw new AppError("Title and Content can't be empty!", 400)
    }
    const userId = req.user?._id;
    if (!userId) {
        throw new AppError('Unauthorized', 401)
    }
    const blogData: CreateBlogDTO = { title, content, author: userId }

    if (req.file) {
        const upload = await uploadToCloudinary(req.file) as UploadApiResponse;
        blogData.imageUrl = upload.secure_url;
        //`/uploads/${req.file.filename}`
    }
    const blog = await Blog.create(blogData)
    res.status(201).json({
        success: true,
        blog
    })
})

export const getAllBlogPost = asyncHandler(async (req: Request, res: Response) => {
    const blog = await Blog.find().sort({ createdAt: -1 }).populate("author", "name email")
    res.status(200).json(blog)
})

export const getBlogPost = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string }
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid blog id", 400)
    }

    const blog = await Blog.findById(id).populate("author", "name email")
    if (!blog) {
        throw new AppError("Post does not exist", 404)
    }

    return res.status(200).json(blog)

})

export const updateBlogPost = asyncHandler(async (req: Request<{}, {}, updateBlogType>, res: Response) => {
    const { id } = req.params as { id: string }
    const { title, content } = req.body
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid blog id", 400)
    }
    const blog = await Blog.findById(id)

    if (!blog) {
        throw new AppError('Post not found', 404)
    }

    if (typeof title === "string") {
        blog.title = title
    }
    if (typeof content === "string") {
        blog.content = content
    }
    if (req.file) {
        const upload = await uploadToCloudinary(req.file) as UploadApiResponse;
        blog.imageUrl = upload.secure_url;
    }
    await blog.save()
    return res.status(200).json({
        success: true,
        blog
    })
})

export const deleteBlogPost = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string }
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid blog id", 400)
    }
    const deletedBlog = await Blog.findByIdAndDelete(id)
    if (!deletedBlog) {
        throw new AppError("Post not found", 404)
    }
    return res.status(200).json({ success: true, data:deletedBlog })
})
