import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import Reply from "../models/Reply.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";



const isOwner = (ownerId: mongoose.Types.ObjectId, userId: unknown) =>
  ownerId.toString() === String(userId);


export const isBlogAuthorOrAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid blog post ID", 400);
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      throw new AppError("Blog post not found", 404);
    }

    const userId = req.user?._id;

    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    const isAdmin = req.user?.role === "admin";
    const isAuthor = isOwner(blog.author, userId);

    if (!isAuthor && !isAdmin) {
      throw new AppError(
        "Forbidden: administrator access required",
        403,
      );
    }

    next();
  },
);

export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  if (req.user.role !== "admin") {
    throw new AppError(
      "Forbidden: administrator access required",
      403,
    );
  }

  next();
};

export const isCommentAuthor = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.params as {
      commentId: string;
    };

    const userId = req.user?._id;

    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    if (!mongoose.isValidObjectId(commentId)) {
      throw new AppError("Invalid comment ID", 400);
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new AppError("Comment not found", 404);
    }

    if (!isOwner(comment.author, userId)) {
      throw new AppError(
        "Forbidden: administrator access required",
        403,
      );
    }

    next();
  },
);

export const isCommentAuthorOrAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.params as {
      commentId: string;
    };

    const userId = req.user?._id;

    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    if (!mongoose.isValidObjectId(commentId)) {
      throw new AppError("Invalid comment ID", 400);
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new AppError("Comment not found", 404);
    }

    const isAuthor = isOwner(comment.author, userId);
    const isAdmin = req.user?.role === "admin";

    if (!isAuthor && !isAdmin) {
      throw new AppError(
        "Forbidden: administrator access required",
        403,
      );
    }

    next();
  },
);

export const isReplyAuthor = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { replyId } = req.params as {
      replyId: string;
    };

    const userId = req.user?._id;

    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    if (!mongoose.isValidObjectId(replyId)) {
      throw new AppError("Invalid reply ID", 400);
    }

    const reply = await Reply.findById(replyId);

    if (!reply) {
      throw new AppError("Reply not found", 404);
    }

    if (!isOwner(reply.author, userId)) {
      throw new AppError(
        "Forbidden: administrator access required",
        403,
      );
    }

    next();
  },
);

export const isReplyAuthorOrAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { replyId } = req.params as {
      replyId: string;
    };

    const userId = req.user?._id;

    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    if (!mongoose.isValidObjectId(replyId)) {
      throw new AppError("Invalid reply ID", 400);
    }

    const reply = await Reply.findById(replyId);

    if (!reply) {
      throw new AppError("Reply not found", 404);
    }

    const isAuthor = isOwner(reply.author, userId);
    const isAdmin = req.user?.role === "admin";

    if (!isAuthor && !isAdmin) {
      throw new AppError(
        "Forbidden: administrator access required",
        403,
      );
    }

    next();
  },
);

export const checkSuspension = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      throw new AppError("Authentication required", 401);
    }

    const isSuspended =
      user.suspendedUntil &&
      user.suspendedUntil.getTime() > Date.now();

    if (isSuspended) {
      throw new AppError(
        "Account is currently suspended",
        403,
      );
    }

    next();
  },
);
