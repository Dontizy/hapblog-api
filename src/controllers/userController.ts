import type { Response, Request } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { registerType, loginType } from "../types/userTypes.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import mongoose from "mongoose";
import Blog from "../models/Blog.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import { UploadApiResponse } from "cloudinary";
import { v2 as cloudinary } from "cloudinary";
import Comment from "../models/Comment.js";
import crypto from "crypto";
import { resend } from "../config/resend.js";
import { createNotification } from "../utils/createNotification.js";

const hashPassword = async (plainPassword: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

export const register = asyncHandler(
  async (req: Request<{}, {}, registerType>, res: Response) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      throw new AppError("All fields are required", 400);
    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(normalizedEmail))
      throw new AppError("Please add a valid email", 400);
    const userExist = await User.findOne({ email: normalizedEmail });
    if (userExist) throw new AppError("User already exists, login", 409);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await hashPassword(password),
    });
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new AppError("Server configuration error", 500);
    const token = jwt.sign({ id: String(user._id) }, secret, {
      expiresIn: "1d",
    });
    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
      },
      token,
    });
  },
);

//login controller
export const login = asyncHandler(
  async (req: Request<{}, {}, loginType>, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(
        "Invalid credentials: email and password are required",
        400,
      );
    }
    const emailLowercase = email.trim().toLowerCase();
    const user = await User.findOne({ email: emailLowercase }).select(
      "+password",
    );
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      throw new AppError("Invalid credentials", 401);
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError("Server configuration error", 500);
    }
    const token = jwt.sign({ id: String(user._id) }, secret, {
      expiresIn: "1d",
    });
    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
      },
      token,
    });
  },
);

export const allUsers = asyncHandler(async (req: Request, res: Response) => {
  const search = String(req.query.search || "").trim();

  const query: Record<string, unknown> = {};

  if (search) {
    query.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }
  const users = await User.find(query).sort({ createdAt: -1 });
  return res.status(200).json({
    success: true,
    users,
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid user id", 400);
  }
  const user = await User.findById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // 1. Fetch only the IDs of the user's blogs (highly efficient)
  const userBlogs = await Blog.find({ author: user._id }).select("_id");
  const blogIds = userBlogs.map((blog) => blog._id);
  if (blogIds.length > 0) {
    await Comment.deleteMany({ blog: { $in: blogIds } });
  }
  await Blog.deleteMany({ author: user._id });
  await User.findByIdAndDelete(id);

  return res.status(200).json({
    success: true,
    message: "User and associated blogs deleted successfully",
  });
});

export const changePassword = asyncHandler(
  async (
    req: Request<{}, {}, { newPassword: string; oldPassword: string }>,
    res: Response,
  ) => {
    const id = req.user?._id;
    const { newPassword, oldPassword } = req.body;

    if (!id) {
      throw new AppError("Not authorized", 401);
    }

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid user id", 400);
    }
    const user = await User.findById(id).select("+password");
    if (!user) {
      throw new AppError("User does not exist", 404);
    }
    if (!oldPassword || !newPassword) {
      throw new AppError("All fields are required", 400);
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new AppError("Incorrect old password!", 403);
    }
    const samePassword = await bcrypt.compare(newPassword, user.password);
    if (samePassword) {
      throw new AppError("New password must be different", 400);
    }
    user.password = await hashPassword(newPassword);
    await user.save();
    res.status(200).json({ success: true, message: "Password updated" });
  },
);

export const addOrRemoveAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid user ID", 400);
    }
    const user = await User.findById(id);

    if (!user) {
      throw new AppError("User not found", 404);
    }
    if (req.user?._id.toString() === id) {
      throw new AppError("You cannot change your own role", 403);
    }
    if (user.role === "user") {
      user.role = "admin";
    } else {
      user.role = "user";
    }
    await user.save();
    return res.status(200).json({
      success: true,
      user,
      role: user.role,
    });
  },
);

export const updateBio = asyncHandler(async (req: Request, res: Response) => {
  const id = req.user?._id;
  const { bio } = req.body as { bio: string };
  if (!id) {
    throw new AppError("Not authorized", 401);
  }
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid user ID", 400);
  }
  const user = await User.findById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  if (bio.length > 200) {
    throw new AppError("Bio must be less than 200 characters", 400);
  }
  user.bio = bio.trim();
  await user.save();
  return res.status(200).json({
    success: true,
    bio: user.bio,
  });
});

export const myProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const blog = await Blog.countDocuments({ author: user._id });
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user?.avatar,
    bio: user?.bio,
    role: user.role,
    followers: user.followers,
    following: user.following,
    bookmarks: user.bookmarks,
    blogsCount: blog,
    bookmarksCount: user.bookmarks?.length || 0,
    followersCount: user.followers?.length || 0,
    followingCount: user.following?.length || 0,
  };

  return res.status(200).json({ success: true, user: userData });
});

export const avatarUpdate = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.user?._id;
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid user ID", 400);
    }
    const user = await User.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!req.file) {
      throw new AppError("Please upload an image", 400);
    }
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }
    const upload = (await uploadToCloudinary(req.file)) as UploadApiResponse;
    user.avatar = upload.secure_url;
    user.avatarPublicId = upload.public_id;

    await user.save();
    return res.status(200).json({
      success: true,
      user,
    });
  },
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body as { email: string };

    if (!email) {
      throw new AppError("Email is required", 400);
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // generate raw token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // hash token
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // save hashed token
    user.resetPasswordToken = hashedToken;

    // expires in 10 mins
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await resend.emails.send({
      from: "Hapblog <onboarding@resend.dev>",
      to: user.email,
      subject: "Reset Password",
      html: `
        <h2>Password Reset</h2>

        <p>
          Click the link below to reset your password
        </p>

        <a href="${resetUrl}">
          Reset Password
        </a>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.params as { token: string };
    const { password } = req.body as { password: string };

    if (!password) {
      throw new AppError("Password is required", 400);
    }

    // hash incoming token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // find user
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: {
        $gt: new Date(),
      },
    }).select("+resetPasswordToken +resetPasswordExpire +password");

    if (!user) {
      throw new AppError("Invalid or expired token", 400);
    }

    user.password = await hashPassword(password);

    // clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  },
);

export const followUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.user?._id;
  const { userId } = req.params as { userId: string };
  if (!id) {
    throw new AppError("Not authorized", 401);
  }
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError("Invalid user ID", 400);
  }
  if (id.toString() === userId) {
    throw new AppError("You cannot follow yourself", 400);
  }
  const userToFollow = await User.findById(userId);
  const currentUser = await User.findById(id);
  if (!userToFollow || !currentUser) {
    throw new AppError("User not found", 404);
  }
  const isFollowing = currentUser.following.some(
    (id) => id.toString() === userToFollow._id.toString(),
  );

  if (isFollowing) {
    // unfollow
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userToFollow._id.toString(),
    );
    userToFollow.followers = userToFollow.followers.filter(
      (id) => id.toString() !== currentUser._id.toString(),
    );
    await currentUser.save();
    await userToFollow.save();
    return res.status(200).json({
      success: true,
      message: `You have unfollowed ${userToFollow.name}`,
    });
  } else {
    // follow
    currentUser.following?.push(userToFollow._id);
    userToFollow.followers?.push(currentUser._id);
    await currentUser.save();
    await userToFollow.save();

    await createNotification({
      recipient: userToFollow._id,
      sender: currentUser._id,
      type: "follow",
    });
    return res.status(200).json({
      isFollowing: true,
      success: true,
      message: `You are now following ${userToFollow.name}`,
    });
  }
});

export const getUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      throw new AppError("Invalid user ID", 400);
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const currentUserId = req.user?._id;

    const isFollowing = currentUserId
      ? user.followers.some((id) => id.toString() === currentUserId.toString())
      : false;

    const blog = await Blog.countDocuments({ author: user._id });

    const userData = {
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
    };

    return res.status(200).json({
      success: true,
      user: userData,
      isFollowing,
      blogsCount: blog,
    });
  },
);
