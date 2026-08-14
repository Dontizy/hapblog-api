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
import { PopulatedFollower } from "../types/PopulatedFollower.js";



const hashPassword = async (plainPassword: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

export const register = asyncHandler(
  async (req: Request<{}, {}, registerType>, res: Response) => {
    const { username, name, email, password } = req.body;

    if (!username || !name || !email || !password) {
      throw new AppError("All fields are required", 400);
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[a-z0-9_-]{3,30}$/.test(normalizedUsername)) {
      throw new AppError(
        "Username must be 3-30 characters and can only contain letters, numbers, underscores, and hyphens",
        400,
      );
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    if (!emailRegex.test(normalizedEmail)) {
      throw new AppError("Please add a valid email", 400);
    }

    const userExist = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (userExist) {
      throw new AppError("Username or email already exists", 409);
    }

    const user = await User.create({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password: await hashPassword(password),
    });
    await createNotification({
      recipient: user._id,
      type: "welcome",
      title: "Welcome to Hapblog! 🎉",
      message: `Hey ${user.username}, welcome to Hapblog! We're excited to have you here. Start exploring stories, discover new authors, share your thoughts, and when you're ready, publish your own stories with the community. Happy blogging! ✍️❤️`,
    });
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new AppError("Server configuration error", 500);
    }

    const token = jwt.sign({ id: String(user._id) }, secret, {
      expiresIn: "1d",
    });

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
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
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      throw new AppError(
        "Invalid credentials: email and password are required",
        400,
      );
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() },
      ],
    }).select("+password");

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
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        suspendedUntil:user.suspendedUntil
      },
      token,
    });
  },
);

export const allUsers = asyncHandler(async (req: Request, res: Response) => {
  const search = String(req.query.search || "").trim();

  // Extract pagination parameters with safe fallbacks
  const page = Math.max(1, parseInt(String(req.query.page || "1"), 10) || 1);
  const limit = Math.max(1, parseInt(String(req.query.limit || "10"), 10) || 10);
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};

  if (search) {
    const orConditions: Record<string, unknown>[] = [
      {
        username: {
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

    // Search by year: 2026
    if (/^\d{4}$/.test(search)) {
      const year = Number(search);

      const start = new Date(year, 0, 1);
      const end = new Date(year + 1, 0, 1);

      orConditions.push({
        createdAt: {
          $gte: start,
          $lt: end,
        },
      });
    }

    // Search by month: 01 - 12
    if (/^\d{1,2}$/.test(search)) {
      const month = Number(search);

      if (month >= 1 && month <= 12) {
        const currentYear = new Date().getFullYear();

        const start = new Date(currentYear, month - 1, 1);
        const end = new Date(currentYear, month, 1);

        orConditions.push({
          createdAt: {
            $gte: start,
            $lt: end,
          },
        });
      }
    }

    query.$or = orConditions;
  }

  // Fetch total count and paginated user list concurrently
  const [totalUsers, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  res.status(200).json({
    success: true,
    users,
    currentPage: page,
    totalPages: Math.ceil(totalUsers / limit),
    totalUsers,
    limit,
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

    const isMakingAdmin = user.role === "user";

    user.role = isMakingAdmin ? "admin" : "user";

    await user.save();

   return res.status(200).json({
  success: true,
  message: isMakingAdmin
    ? `${user.name} is now an admin`
    : `${user.name} is no longer an admin`,
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
    username: user.username,
    name: user.name,
    email: user.email,
    avatar: user?.avatar,
    bio: user?.bio,
    role: user.role,
    followers: user.followers,
    following: user.following,
    bookmarks: user.bookmarks,
    blogsCount: blog,
    suspendedUntil:user.suspendedUntil,
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
    const { identifier } = req.body as { identifier: string };

    if (!identifier) {
      throw new AppError("Username or email is required", 400);
    }

    const normalizedIdentifier = identifier.trim().toLowerCase();

    const user = await User.findOne({
      $or: [
        { email: normalizedIdentifier },
        { username: normalizedIdentifier },
      ],
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Generate raw token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing it
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;

    // Expires in 10 minutes
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await resend.emails.send({
      from: "Hapblog <onboarding@resend.dev>",
      to: user.email,
      subject: "Reset Password",
      html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset your Hapblog password</title>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f6f6f6;
      font-family: Arial, Helvetica, sans-serif;
      color: #18181b;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="background-color: #f6f6f6; padding: 40px 16px;"
    >
      <tr>
        <td align="center">

          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="
              max-width: 560px;
              background-color: #ffffff;
              border: 1px solid #e4e4e7;
              border-radius: 16px;
              overflow: hidden;
            "
          >

            <!-- Header -->
            <tr>
              <td
                style="
                  padding: 28px 32px;
                  border-bottom: 1px solid #f0f0f0;
                "
              >
                <h1
                  style="
                    margin: 0;
                    font-size: 24px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                    color: #18181b;
                  "
                >
                  Hapblog
                </h1>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px 32px 32px;">

                <h2
                  style="
                    margin: 0 0 16px;
                    font-size: 26px;
                    line-height: 1.3;
                    font-weight: 700;
                    color: #18181b;
                  "
                >
                  Reset your password
                </h2>

                <p
                  style="
                    margin: 0 0 16px;
                    font-size: 15px;
                    line-height: 1.7;
                    color: #52525b;
                  "
                >
                  Hi ${user.name},
                </p>

                <p
                  style="
                    margin: 0 0 16px;
                    font-size: 15px;
                    line-height: 1.7;
                    color: #52525b;
                  "
                >
                  We received a request to reset the password
                  associated with your Hapblog account.
                </p>

                <p
                  style="
                    margin: 0 0 28px;
                    font-size: 15px;
                    line-height: 1.7;
                    color: #52525b;
                  "
                >
                  Click the button below to choose a new password.
                  This link will expire in
                  <strong style="color: #18181b;">10 minutes</strong>.
                </p>

                <!-- Button -->
                <table
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="margin-bottom: 28px;"
                >
                  <tr>
                    <td
                      align="center"
                      style="
                        border-radius: 999px;
                        background-color: #18181b;
                      "
                    >
                      <a
                        href="${resetUrl}"
                        style="
                          display: inline-block;
                          padding: 13px 24px;
                          border-radius: 999px;
                          background-color: #18181b;
                          color: #ffffff;
                          font-size: 14px;
                          font-weight: 600;
                          text-decoration: none;
                        "
                      >
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Fallback URL -->
                <p
                  style="
                    margin: 0 0 8px;
                    font-size: 12px;
                    color: #71717a;
                  "
                >
                  If the button doesn't work, copy and paste this link
                  into your browser:
                </p>

                <p
                  style="
                    margin: 0 0 28px;
                    padding: 12px;
                    background-color: #fafafa;
                    border: 1px solid #e4e4e7;
                    border-radius: 8px;
                    font-size: 12px;
                    line-height: 1.5;
                    word-break: break-all;
                  "
                >
                  <a
                    href="${resetUrl}"
                    style="
                      color: #52525b;
                      text-decoration: none;
                    "
                  >
                    ${resetUrl}
                  </a>
                </p>

                <!-- Security notice -->
                <div
                  style="
                    padding: 16px;
                    background-color: #fafafa;
                    border-radius: 10px;
                  "
                >
                  <p
                    style="
                      margin: 0;
                      font-size: 13px;
                      line-height: 1.6;
                      color: #71717a;
                    "
                  >
                    If you didn't request a password reset, you can
                    safely ignore this email. Your password will remain
                    unchanged.
                  </p>
                </div>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  padding: 24px 32px;
                  background-color: #fafafa;
                  border-top: 1px solid #f0f0f0;
                "
              >
                <p
                  style="
                    margin: 0;
                    font-size: 12px;
                    line-height: 1.6;
                    color: #a1a1aa;
                    text-align: center;
                  "
                >
                  This is an automated message from Hapblog.
                  Please don't reply to this email.
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
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

    if (password.length < 5) {
      throw new AppError("Password must be at least 5 characters", 400);
    }

    // Hash incoming token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid, non-expired token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: {
        $gt: new Date(),
      },
    }).select("+resetPasswordToken +resetPasswordExpire +password");


    // Update password
    user.password = await hashPassword(password);

    // Invalidate reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

   return res.status(200).json({
  success: true,
  message: "If an account exists, a password reset link has been sent.",
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
    // Unfollow
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userToFollow._id.toString(),
    );

    userToFollow.followers = userToFollow.followers.filter(
      (id) => id.toString() !== currentUser._id.toString(),
    );

    await Promise.all([currentUser.save(), userToFollow.save()]);

    return res.status(200).json({
      success: true,
      isFollowing: false,
      message: `You have unfollowed ${userToFollow.username}`,
    });
  }

  // Follow
  currentUser.following.push(userToFollow._id);
  userToFollow.followers.push(currentUser._id);

  await Promise.all([currentUser.save(), userToFollow.save()]);

  await createNotification({
    recipient: userToFollow._id,
    sender: currentUser._id,
    type: "follow",
  });

  return res.status(200).json({
    success: true,
    isFollowing: true,
    message: `You are now following ${userToFollow.username}`,
  });
});

export const getUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { username } = req.params as { username: string };

    const user = await User.findOne({ username })
      .select("username name email avatar bio followers following")
      .lean();

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const blogsCount = await Blog.countDocuments({
      author: user._id,
    });

    const currentUserId = req.user?._id?.toString();

    const isFollowing = currentUserId
      ? user.followers.some((id) => id.toString() === currentUserId)
      : false;

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        followersCount: user.followers.length,
        followingCount: user.following.length,
      },
      blogsCount,
      isFollowing,
    });
  },
);

export const userFollowers = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    if (!mongoose.isValidObjectId(userId)) {
      throw new AppError("Invalid id", 400);
    }

    const user = await User.findById(userId)
      .select("followers following")
      .populate<{
        followers: PopulatedFollower[];
      }>("followers", "username name avatar bio")
      .lean();

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const followingSet = new Set(user.following.map((id) => id.toString()));

    const followers = user.followers.map((follower) => ({
      _id: follower._id,
      username: follower.username,
      name: follower.name,
      avatar: follower.avatar,
      bio: follower.bio,
      suspendedUntil?: follower.suspendedUntil,
      isFollowing: followingSet.has(follower._id.toString()),
    }));

    return res.status(200).json({
      success: true,
      followers,
    });
  },
);

export const publicUserFollowers = asyncHandler(
  async (req: Request, res: Response) => {
    const { username } = req.params as { username: string };

    if (!username) {
      throw new AppError("Username is required", 400);
    }

    const normalizedUsername = username.toLowerCase();

    const user = await User.findOne({ username: normalizedUsername })
      .select("followers")
      .populate<{
        followers: PopulatedFollower[];
      }>("followers", "username name avatar bio")
      .lean();

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const me = await User.findById(req.user?._id).select("following").lean();

    if (!me) {
      throw new AppError("Logged-in user not found", 404);
    }

    const followingSet = new Set(me.following.map((id) => id.toString()));

    const followers = user.followers.map((follower) => ({
      _id: follower._id,
      username: follower.username,
      name: follower.name,
      avatar: follower.avatar,
      bio: follower.bio,
     
      isFollowing: followingSet.has(follower._id.toString()),
    }));

    return res.status(200).json({
      success: true,
      followers,
    });
  },
);

export const publicUserFollowing = asyncHandler(
  async (req: Request, res: Response) => {
    const { username } = req.params as { username: string };

    const user = await User.findOne({ username })
      .select("following followers")
      .populate<{
        following: PopulatedFollower[];
      }>("following", "username name avatar bio")
      .lean();

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const followerSet = new Set(user.followers.map((id) => id.toString()));

    const following = user.following.map((followedUser) => ({
      _id: followedUser._id,
      username: followedUser.username,
      name: followedUser.name,
      avatar: followedUser.avatar,
      bio: followedUser.bio,
      isFollowingBack: followerSet.has(followedUser._id.toString()),
    }));

    return res.status(200).json({
      success: true,
      following,
    });
  },
);

export const userFollowing = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    if (!mongoose.isValidObjectId(userId)) {
      throw new AppError("Invalid id", 400);
    }

    const user = await User.findById(userId)
      .select("following followers")
      .populate<{
        following: PopulatedFollower[];
      }>("following", "username name avatar bio")
      .lean();

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const followerSet = new Set(user.followers.map((id) => id.toString()));

    const following = user.following.map((followedUser) => ({
      _id: followedUser._id,
      username: followedUser.username,
      name: followedUser.name,
      avatar: followedUser.avatar,
      bio: followedUser.bio,
      isFollowingBack: followerSet.has(followedUser._id.toString()),
    }));

    return res.status(200).json({
      success: true,
      following,
    });
  },
);

export const suspendUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params as { userId: string };
  const { days } = req.body as { days: number };

  const admin = req.user;

  if (!admin) {
    throw new AppError("Authentication required", 401);
  }

  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError("Invalid user ID", 400);
  }

  if (!Number.isInteger(days) || days < 1 || days > 7) {
    throw new AppError("Suspension duration must be between 1 and 7 days", 400);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const suspendedUntil = new Date();
  suspendedUntil.setDate(suspendedUntil.getDate() + days);

  user.suspendedUntil = suspendedUntil;

  await user.save();

  await createNotification({
    recipient: user._id,
    sender: admin._id,
    type: "announcement",
    announcementType: "suspension",
    title: "Account suspended",
    message: `Your account has been suspended for ${days} day${
      days === 1 ? "" : "s"
    }.`,
    suspendedUntil,
  });

  return res.status(200).json({
    success: true,
    message: `User suspended for ${days} day${days === 1 ? "" : "s"}.`,
    suspendedUntil: user.suspendedUntil,
  });
});

export const getDraft = asyncHandler(async (req: Request, res: Response) => {
 const userId = req.user?._id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const drafts = await Blog.find({
      author: userId,
      status: "draft",
    })
      .sort({ updatedAt: -1 })
      .populate("author", "name avatar");

    res.status(200).json({
      success: true,
      count: drafts.length,
      drafts,
    });
});

export const getUserPosts = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const posts = await Blog.find({
      author: userId,
    })
      .sort({ createdAt: -1 })
      .populate("author", "name avatar");

    res.status(200).json({
      success: true,
      posts,
    });
  },
);

export const searchAuthors = asyncHandler(
  async (req: Request, res: Response) => {
    const search = String(req.query.search || "").trim();

    if (!search) {
      return res.status(200).json({
        success: true,
        authors: [],
      });
    }

    const authors = await User.find({
      $or: [
        {
          username: {
            $regex: search,
            $options: "i",
          },
        },
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
      ],
    })
      .select("username name avatar")
      .sort({ username: 1 })
      .limit(20);

    res.status(200).json({
      success: true,
      authors,
    });
  },
);
