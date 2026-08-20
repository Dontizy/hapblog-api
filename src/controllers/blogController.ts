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
import { getReadingTime } from "../utils/readingTime.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import slugify from "slugify";

export const createBlogPost = asyncHandler(
  async (req: Request<{}, {}, blogCreateType>, res: Response) => {
    const { title, content, category, status } = req.body;

    const user = req.user;

    if (!user) {
      throw new AppError("Not authorized", 401);
    }

    if (!title?.trim()) {
      throw new AppError("Title can't be empty!", 400);
    }

    if (!content?.trim()) {
      throw new AppError("Content can't be empty!", 400);
    }

    const postStatus = status ?? "draft";

    if (!["draft", "published"].includes(postStatus)) {
      throw new AppError("Invalid post status", 400);
    }

    // A published post must have a category.
    if (postStatus === "published" && !category) {
      throw new AppError("A category is required when publishing a post", 400);
    }

    // Check suspension before publishing.
    if (
      postStatus === "published" &&
      user.suspendedUntil &&
      user.suspendedUntil > new Date()
    ) {
      throw new AppError("Suspended users cannot publish posts", 403);
    }

    // Validate category if one was supplied.
    if (category) {
      const categoryExists = await Category.exists({
        _id: category,
      });

      if (!categoryExists) {
        throw new AppError("Invalid category", 400);
      }
    }

    // Generate a unique slug from the title.
    const baseSlug = slugify(title.trim(), {
      lower: true,
      strict: true,
      trim: true,
    });

    let slug = baseSlug;
    let counter = 1;

    while (await Blog.exists({ slug })) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    const blogData: CreateBlogDTO = {
      title: title.trim(),
      content,
      category: category ?? null,
      slug,
      author: user._id,
      status: postStatus,
    };

    if (req.file) {
      const upload = (await uploadToCloudinary(req.file)) as UploadApiResponse;

      blogData.imageUrl = upload.secure_url;
    }

    const blog = await Blog.create(blogData);

    return res.status(201).json({
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

    const query: Record<string, unknown> = {
      status: "published",
    };

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
        .populate("author", "username name avatar bio")
        .populate("category", "name _id slug")
        .populate("commentsCount"),
      Blog.countDocuments(query),
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
  const { slug } = req.params as { slug: string };

  const userId = req.user?._id;

  const blog = await Blog.findOne({
    slug,
    ...(userId
      ? {
          $or: [{ status: "published" }, { author: userId }],
        }
      : {
          status: "published",
        }),
  })
    .populate("author", "username name avatar bio")
    .populate("category", "name _id slug");

  if (!blog) {
    throw new AppError("Post does not exist", 404);
  }

  const [commentsCount, user] = await Promise.all([
    Comment.countDocuments({
      blog: blog._id,
    }),

    userId ? User.findById(userId).select("bookmarks") : null,
  ]);

  const bookmarkedIds = new Set(
    user?.bookmarks.map((bookmark) => bookmark.toString()) ?? [],
  );

  const isLiked = !!userId && blog.likes.some((like) => like.equals(userId));

  const blogData = blog.toObject();

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

    const { title, content, category, status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid blog id", 400);
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      throw new AppError("Post not found", 404);
    }

    // Update title
    if (typeof title === "string") {
      const trimmedTitle = title.trim();

      if (!trimmedTitle) {
        throw new AppError("Title can't be empty", 400);
      }

      blog.title = trimmedTitle;
    }

    // Update content
    if (typeof content === "string") {
      if (!content.trim()) {
        throw new AppError("Content can't be empty", 400);
      }

      blog.content = content;
    }

    // Update category only when supplied
    if (category !== undefined) {
      if (!mongoose.isValidObjectId(category)) {
        throw new AppError("Invalid category", 400);
      }

      const categoryExists = await Category.exists({
        _id: category,
      });

      if (!categoryExists) {
        throw new AppError("Category not found", 404);
      }

      blog.category = new mongoose.Types.ObjectId(category);
    }

    // Update status
    if (status !== undefined) {
      if (status !== "draft" && status !== "published") {
        throw new AppError("Invalid post status", 400);
      }

      // Prevent suspended users from publishing
      if (
        status === "published" &&
        req.user?.suspendedUntil &&
        req.user.suspendedUntil > new Date()
      ) {
        throw new AppError("Suspended users cannot publish posts", 403);
      }

      blog.status = status;
    }

    // Update image
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
      message: hasLiked ? "Post unliked" : "Post liked",
    });
  },
);

export const getMyDrafts = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError("Not authorized", 401);
  }

  // Pagination
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);

  const limit = Math.max(
    1,
    Math.min(50, parseInt(req.query.limit as string, 10) || 10),
  );

  const skip = (page - 1) * limit;

  const filter = {
    author: user._id,
    status: "draft",
  } as const;

  const [drafts, totalDrafts] = await Promise.all([
    Blog.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username name avatar bio"),

    Blog.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    drafts,
    pagination: {
      totalDrafts,
      page,
      limit,
      totalPages: Math.ceil(totalDrafts / limit),
    },
  });
});

export const publishBlogPost = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid blog id", 400);
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      throw new AppError("Post not found", 404);
    }

    blog.status = "published";

    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Post published successfully",
      blog,
    });
  },
);
