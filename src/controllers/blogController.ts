import type { Request, Response } from "express";
import Blog from "../models/Blog.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { blogCreateType, updateBlogType } from "../types/blogTypes.js";
import { CreateBlogDTO } from "../dto/BlogData.dto.js";
import mongoose from "mongoose";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import { UploadApiResponse } from "cloudinary";
import Comment from "../models/Comment.js";
import Reply from "../models/Reply.js";
import { createNotification } from "../utils/createNotification.js";
import { isBlogCategory } from "../config/categoryGaurd.js";
import { getReadingTime } from "../utils/readingTime.js";
import User from "../models/User.js";

export const createBlogPost = asyncHandler(
  async (req: Request<{}, {}, blogCreateType>, res: Response) => {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      throw new AppError("Title, Content and Category can't be empty!", 400);
    }
    const user = req.user;
    if (!user) {
      throw new AppError("Not authorized", 401);
    }
    const userId = user._id;

    const blogData: CreateBlogDTO = {
      title,
      content,
      category,
      author: userId,
    };

    if (req.file) {
      const upload = (await uploadToCloudinary(req.file)) as UploadApiResponse;
      blogData.imageUrl = upload.secure_url;
    }
    const blog = await Blog.create(blogData);
    res.status(201).json({
      success: true,
      blog,
    });
  },
);

export const getAllBlogPost = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const search = String(req.query.search || "").trim();

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          content: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const [blogs, totalBlogs] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "name avatar bio")
        .populate("commentsCount"),
      Blog.countDocuments(),
    ]);

    const userId = req.user?._id;

    let bookmarkedIds = new Set<string>();

    if (userId) {
      const user = await User.findById(userId).select("bookmarks");

      bookmarkedIds = new Set(user?.bookmarks.map((id) => id.toString()) ?? []);
    }

    const blogsWithStatus = blogs.map((blog) => {
      const blogObject = blog.toObject();

      return {
        ...blogObject,
        isLiked: !!userId && blog.likes.some((like) => like.equals(userId)),
        isBookmarked: bookmarkedIds.has(blog._id.toString()),
        readingTime: getReadingTime(blogObject.content),
      };
    });

    res.status(200).json({
      success: true,
      blogs: blogsWithStatus,
      currentPage: page,
      totalPages: Math.ceil(totalBlogs / limit),
      totalBlogs,
      limit,
    });
  },
);

export const getBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid blog id", 400);
  }

  const [blog, commentsCount] = await Promise.all([
    Blog.findById(id).populate("author", "name avatar bio"),
    Comment.countDocuments({ blog: id }),
  ]);

  if (!blog) {
    throw new AppError("Post does not exist", 404);
  }
  const userId = req.user?._id;

  let bookmarkedIds = new Set<string>();

  if (userId) {
    const user = await User.findById(userId).select("bookmarks");

    bookmarkedIds = new Set(user?.bookmarks.map((id) => id.toString()) ?? []);
  }

  const isLiked = !!userId && blog.likes.some((like) => like.equals(userId));
  const blogData = blog.toObject();
  console.log("isLiked", isLiked);
  return res.status(200).json({
    success: true,
    blog: {
      ...blogData,
      commentsCount,
      isLiked,
      isBookmarked: bookmarkedIds.has(blog._id.toString()),
      readingTime: getReadingTime(blogData.content),
    },
  });
});

export const updateBlogPost = asyncHandler(
  async (req: Request<{}, {}, updateBlogType>, res: Response) => {
    const { id } = req.params as { id: string };
    const { title, content, category } = req.body;
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid blog id", 400);
    }
    const blog = await Blog.findById(id);

    if (!blog) {
      throw new AppError("Post not found", 404);
    }

    if (typeof title === "string") {
      blog.title = title;
    }
    if (typeof content === "string") {
      blog.content = content;
    }
    if (isBlogCategory(category)) {
      blog.category = category;
    }

    if (req.file) {
      const upload = (await uploadToCloudinary(req.file)) as UploadApiResponse;
      blog.imageUrl = upload.secure_url;
    }
    await blog.save();
    return res.status(200).json({
      success: true,
      blog,
    });
  },
);

export const deleteBlogPost = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid blog id", 400);
    }
    const blog = await Blog.findById(id);

    if (!blog) {
      throw new AppError("Post not found", 404);
    }
    const comments = await Comment.find({ blog: blog._id })
      .select("_id")
      .lean();
    const commentIds = comments.map((comment) => comment._id);
    if (commentIds.length > 0) {
      await Reply.deleteMany({
        comment: { $in: commentIds },
      });
    }
    await Comment.deleteMany({ blog: blog._id });
    await Blog.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ success: true, message: "Blog post deleted successfully" });
  },
);

export const toggleLikePost = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as {
      id: string;
    };
    const user = req.user;
    if (!user) {
      throw new AppError("Not authorized ", 401);
    }
    const userId = user._id;
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid blog post ID", 400);
    }
    const blog = await Blog.findById(id);
    if (!blog) {
      throw new AppError("Blog post not found", 404);
    }
    const alreadyLiked = blog.likes.some(
      (like) => like.toString() === userId.toString(),
    );

    const hasLiked = blog.likes.some(
      (like) => like.toString() === userId.toString(),
    );

    await Blog.findByIdAndUpdate(id, {
      [hasLiked ? "$pull" : "$addToSet"]: {
        likes: userId,
      },
    });

    if (!hasLiked) {
      await createNotification({
        recipient: blog.author.toString(),
        sender: userId.toString(),
        type: "blog_like",
        blog: blog._id.toString(),
      });
    }

    return res.status(200).json({
      success: true,
      message: hasLiked
        ? "Post unliked successfully"
        : "Post liked successfully",
    });
  },
);
