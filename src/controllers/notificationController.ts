import {asyncHandler} from "../utils/asyncHandler.js"
import {AppError} from "../utils/AppError.js"
import Notification from "../models/Notification.js"
import type {Request, Response} from "express"


export const getNotifications =
  asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const userId = req.user?.id
     
     if(!userId){
       throw new AppError("User not authorized", 401)
     }
      const notifications =
        await Notification.find({
          recipient:userId
        })
          .sort({
            createdAt: -1,
          })
          .populate(
            "sender",
            "name avatar"
          )
          .populate(
            "blog",
            "title"
          );
      
      const unReadCount = await Notification.countDocuments({isRead:false, recipient:userId})

      return res.status(200).json({
        success: true,
        notifications,
        unReadCount
      });
    
    });
  
  
export const markNotificationAsRead =
  asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {

      const { id } = req.params as {
        id: string;
      };

      const notification =
        await Notification.findById(id);

      if (!notification) {
        throw new AppError(
          "Notification not found",
          404
        );
      }

      notification.isRead = true;

      await notification.save();

      return res.status(200).json({
        success: true,
        message:
          "Notification marked as read",
      });
    }
);

export const openNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      blogId: notification.blog,
    });
  }
);

