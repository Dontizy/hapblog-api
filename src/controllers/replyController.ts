import type { Request, Response } from "express";
import Reply from "../models/Reply.js";
import Comment from "../models/Comment.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

import { createNotification } from "../utils/createNotification.js";

export const createReply = asyncHandler(async (req: Request, res: Response) => {
  const { commentId } = req.params as { commentId: string };

  if (!mongoose.isValidObjectId(commentId)) {
    throw new AppError("Invalid comment ID", 400);
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError("Comment not found!", 404);
  }
  const { body } = req.body as { body: string };

  if (!body?.trim()) {
    throw new AppError("Reply is required", 400);
  }
  const user = req.user;
  if (!user) {
    throw new AppError("Not authorized", 401);
  }
  const userId = user._id;
  const reply = await Reply.create({
    author: userId,
    comment: comment._id,
    body: body.trim(),
  });

  await createNotification({
    recipient: comment.author.toString(),
    sender: userId,
    type: "reply",
    blog: comment.blog.toString(),
    comment: comment._id.toString(),
    reply: reply._id.toString(),
  });

  return res.status(201).json({
    success: true,
    message: "Reply sent successfully",
    reply,
  });
});

export const fetchReplies = asyncHandler(
  async (req: Request, res: Response) => {
    const { commentId } = req.params as { commentId: string };

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    if (!mongoose.isValidObjectId(commentId)) {
      throw new AppError("Invalid comment ID", 400);
    }

    const comment = await Comment.exists({ _id: commentId });

    if (!comment) {
      throw new AppError("Comment not found", 404);
    }

    const [replies, totalReplies] = await Promise.all([
      Reply.find({ comment: commentId })
        .populate("author", "avatar name username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Reply.countDocuments({ comment: commentId }),
    ]);

    const userId = req.user?._id;

    const repliesWithLikeStatus = replies.map((reply) => ({
      ...reply.toObject(),
      isLiked: !!userId && reply.likes.some((like) => like.equals(userId)),
    }));

    return res.status(200).json({
      success: true,
      totalReplies,
      replies: repliesWithLikeStatus,
      currentPage: page,
      totalPages: Math.ceil(totalReplies / limit),
    });
  },
);

export const updateReply = asyncHandler(async (req: Request, res: Response) => {
  const { id, replyId } = req.params as { id: string; replyId: string };
  const { body } = req.body as { body: string };
  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(replyId)) {
    throw new AppError("Invalid comment or reply id", 400);
  }
  if (!body?.trim()) {
    throw new AppError("Reply body is required", 400);
  }

  const comment = await Comment.exists({ _id: id });

  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  const reply = await Reply.findOne({ _id: replyId, comment: id });

  if (!reply) {
    throw new AppError("Reply not found", 404);
  }
  reply.body = body.trim();
  await reply.save();
  return res.status(200).json({
    success: true,
    message: "Reply updated",
    reply,
  });
});

export const deleteReply = asyncHandler(async (req: Request, res: Response) => {
  const { id, replyId } = req.params as {
    id: string;
    replyId: string;
  };

  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(replyId)) {
    throw new AppError("Invalid comment or reply ID", 400);
  }

  const comment = await Comment.exists({ _id: id });

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
    message: "Reply deleted",
  });
});

export const toggleReplyLike = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, replyId } = req.params as {
      id: string;
      replyId: string;
    };

    const userId = req.user?._id;
    const comment = await Comment.findById(id);
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(replyId)) {
      throw new AppError("Invalid comment or reply ID", 400);
    }
    if (!userId) {
      throw new AppError("User not authorized", 401);
    }
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

    const hasLiked = reply.likes.some(
      (like) => like.toString() === userId.toString(),
    );

    await Reply.findByIdAndUpdate(replyId, {
      [hasLiked ? "$pull" : "$addToSet"]: {
        likes: userId,
      },
    });

    if (!hasLiked) {
      await createNotification({
        recipient: reply.author.toString(),
        sender: userId.toString(),
        type: "reply_like",
        blog: comment.blog.toString(),
        comment: comment._id.toString(),
        reply: reply._id.toString(),
      });
    }
    return res.status(200).json({
      success: true,
      liked: !hasLiked,
      message: hasLiked
        ? "Reply unliked"
        : "Reply liked",
    });
  },
);
