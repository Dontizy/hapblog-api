import mongoose from "mongoose"
import User from "../models/User.js"
import Blog from "../models/Blog.js"
import { AppError } from "../utils/AppError.js"
import {asyncHandler} from "../utils/asyncHandler.js"


export const getBookmarks =
  asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {

      const user = await User.findById(
        req.user.id
      ).populate({
        path: "bookmarks",
        populate: {
          path: "author",
          select: "name email",
        },
      });

      return res.status(200).json({
        success: true,
        bookmarks: user?.bookmarks,
      });
    }
  );
  
export const toggleBookmark =
  asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {

      const { id } = req.params as {
        id: string;
      };

      const userId = req.user.id;

      if (
        !mongoose.isValidObjectId(id)
      ) {
        throw new AppError(
          "Invalid blog id",
          400
        );
      }

      const blog = await Blog.findById(id);

      if (!blog) {
        throw new AppError(
          "Blog not found",
          404
        );
      }

      const user = await User.findById(
        userId
      );

      if (!user) {
        throw new AppError(
          "User not found",
          404
        );
      }

      const alreadyBookmarked =
        user.bookmarks.some(
          (bookmark) =>
            bookmark.toString() === id
        );

      // remove bookmark
      if (alreadyBookmarked) {

        user.bookmarks =
          user.bookmarks.filter(
            (bookmark) =>
              bookmark.toString() !== id
          );

        await user.save();

        return res.status(200).json({
          success: true,
          message:
            "Bookmark removed",
        });
      }

      // add bookmark
      user.bookmarks.push(blog._id);

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Blog bookmarked",
      });
    }
  );