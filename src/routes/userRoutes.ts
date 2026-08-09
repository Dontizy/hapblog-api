import { Router } from "express";
import {
  register,
  login,
  deleteUser,
  allUsers,
  changePassword,
  addOrRemoveAdmin,
  followUser,
  updateBio,
  getUserProfile,
  myProfile,
  avatarUpdate,
  forgotPassword,
  resetPassword,
  userFollowers,
  publicUserFollowers,
  userFollowing,
  publicUserFollowing,
  suspendUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/authorizedUser.js";
import { upload } from "../utils/uploader.js";
import {
  getNotifications,
  markNotificationAsRead,
  openNotification,
} from "../controllers/notificationController.js";

import { broadcastNotification } from "../controllers/broadcastController.js";

const router = Router();

/**
 * @openapi
 * /user/register:
 *   post:
 *     summary: Register a user
 *     description: This endpoint is used to create a new user account.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - name
 *               - password
 *             properties:
 *               username:
 *                 type:string
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Required field
 *       409:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
router.post("/register", register);

/**
 * @openapi
 * /user/login:
 *   post:
 *     summary: Login user
 *     description: Login using a username or email address
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful
 *       400:
 *         description: Required field
 *       500:
 *         description: Server error
 */
router.post("/login", login);

/**
 * @openapi
 * /user/auth/delete/{id}:
 *   delete:
 *     summary: Admin delete a user
 *     description: An admin delete a user and all blogs associated with the user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User and associated blogs deleted successfully
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Only admin allowed
 *       404:
 *         description: User not found
 */
router.delete("/auth/delete/:id", protect, isAdmin, deleteUser);

/**
 * @openapi
 * /user/auth/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve all users (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Only admin allowed
 */
router.get("/auth/users", protect, isAdmin, allUsers);

/**
 * @openapi
 * /user/auth/password-update:
 *   put:
 *     summary: Update user password
 *     description: Change the authenticated user's password
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Incorrect old password
 *       404:
 *         description: User not found
 */
router.put("/auth/password-update", protect, changePassword);

/**
 * @swagger
 * /user/auth/admin/{id}:
 *   patch:
 *     summary: Add or remove admin role
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 */
router.patch("/auth/admin/:id", protect, isAdmin, addOrRemoveAdmin);

/**
 * @swagger
 * /user/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *       404:
 *         description: User not found
 */
router.get("/auth/profile", protect, myProfile);

/**
 * @swagger
 * /user/auth/avatar:
 *   patch:
 *     summary: Update user avatar
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.patch("/auth/avatar", protect, upload.single("avatar"), avatarUpdate);

/**
 * @swagger
 * /user/auth/forgot-password:
 *   post:
 *     summary: Send password reset email
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@gmail.com
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 */
router.post("/auth/forgot-password", forgotPassword);

/**
 * @swagger
 * /user/auth/reset-password/{token}:
 *   post:
 *     summary: Reset user password
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post("/auth/reset-password/:token", resetPassword);

/**
 * @swagger
 * /user/auth/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 unreadCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/auth/notifications", protect, getNotifications);

/**
 * @swagger
 * /user/auth/notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch("/auth/notifications/:id/read", protect, markNotificationAsRead);

/**
 * @swagger
 * /user/auth/notifications/{id}/open:
 *   get:
 *     summary: Open a notification and mark it as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification opened successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 blogId:
 *                   type: string
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/auth/notifications/:id/open", protect, openNotification);

/**
 * @swagger
 * /user/auth/bio/update:
 *   patch:
 *     summary: Update user bio
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bio
 *             properties:
 *               bio:
 *                 type: string
 *                 maxLength: 200
 *                 example: Full-stack developer passionate about web technologies.
 *     responses:
 *       200:
 *         description: Bio updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 bio:
 *                   type: string
 *       400:
 *         description: Invalid user ID or bio exceeds 200 characters
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch("/auth/bio/update", protect, updateBio);

/**
 * @openapi
 * /user/auth/{username}:
 *   get:
 *     summary: Get user profile by username
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         example: "johndoe"
 *         description: Username of the user profile to retrieve
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "65f1a2b3c4d5e6f7a8b9c0d1"
 *                     username:
 *                       type: string
 *                       example: "johndoe"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     avatar:
 *                       type: string
 *                       example: "https://example.com/avatar.jpg"
 *                     bio:
 *                       type: string
 *                       example: "Full stack developer"
 *                     followersCount:
 *                       type: integer
 *                       example: 12
 *                     followingCount:
 *                       type: integer
 *                       example: 8
 *                 blogsCount:
 *                   type: integer
 *                   example: 5
 *                 isFollowing:
 *                   type: boolean
 *                   example: false
 *       404:
 *         description: User not found
 */
router.get("/auth/:username", protect, getUserProfile);

/**
 * @openapi
 * /user/auth/followers:
 *   get:
 *     summary: Get authenticated user's followers
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Followers list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 followers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "65f1a2b3c4d5e6f7a8b9c0d1"
 *                       username:
 *                         type: string
 *                         example: "mikel"
 *                       avatar:
 *                         type: string
 *                         example: "https://example.com/avatar.jpg"
 *                       bio:
 *                         type: string
 *                         example: "Full stack developer"
 *                       isFollowing:
 *                         type: boolean
 *                         example: true
 *       400:
 *         description: Invalid user ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/auth/followers", protect, userFollowers);

/**
 * @openapi
 * /users/{username}/followers:
 *   get:
 *     summary: Get public user's followers by username
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         example: "johndoe"
 *         description: Username of the target user
 *     responses:
 *       200:
 *         description: Followers list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 followers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "65f1a2b3c4d5e6f7a8b9c0d1"
 *                       username:
 *                         type: string
 *                         example: "janesmith"
 *                       avatar:
 *                         type: string
 *                         example: "https://example.com/avatar.jpg"
 *                       bio:
 *                         type: string
 *                         example: "Full stack developer"
 *                       isFollowing:
 *                         type: boolean
 *                         example: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Target user or logged-in user not found
 */
router.get("/auth/:userId/followers", protect, publicUserFollowers);

/**
 * @openapi
 * /user/auth/following:
 *   get:
 *     summary: Get authenticated user's following list
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Following list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 following:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "65f1a2b3c4d5e6f7a8b9c0d1"
 *                       username:
 *                         type: string
 *                         example: "johndoe"
 *                       avatar:
 *                         type: string
 *                         example: "https://example.com/avatar.jpg"
 *                       bio:
 *                         type: string
 *                         example: "Full stack developer"
 *                       isFollowingBack:
 *                         type: boolean
 *                         example: true
 *       400:
 *         description: Invalid user ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/auth/following", protect, userFollowing);


/**
 * @openapi
 * /user/auth/{username}/following:
 *   get:
 *     summary: Get public user's following list by username
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         example: "johndoe"
 *         description: Username of the user whose following list is being retrieved
 *     responses:
 *       200:
 *         description: Following list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 following:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "65f1a2b3c4d5e6f7a8b9c0d1"
 *                       username:
 *                         type: string
 *                         example: "janesmith"
 *                       avatar:
 *                         type: string
 *                         example: "https://example.com/avatar.jpg"
 *                       bio:
 *                         type: string
 *                         example: "Full stack developer"
 *                       isFollowingBack:
 *                         type: boolean
 *                         example: true
 *       404:
 *         description: User not found
 */
router.get("/auth/:username/following", protect, publicUserFollowing);

/**
 * @openapi
 * /user/notifications/broadcast:
 *   post:
 *     summary: Broadcast notification to all users
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *                 example: "System Maintenance"
 *               message:
 *                 type: string
 *                 example: "The platform will be down for maintenance at midnight."
 *     responses:
 *       201:
 *         description: Notification broadcasted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notification sent to all users"
 *                 recipientCount:
 *                   type: integer
 *                   example: 150
 *       400:
 *         description: Title and message are required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No users found
 */
router.post(
  "/notifications/broadcast",
  protect,
  isAdmin,
  broadcastNotification,
);

/**
 * @openapi
 * /user/auth/{userId}/suspend:
 *   patch:
 *     summary: Suspend a user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: "65f1a2b3c4d5e6f7a8b9c0d1"
 *         description: ID of the user to suspend
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - days
 *             properties:
 *               days:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 7
 *                 example: 3
 *                 description: Number of days to suspend the user (1-7)
 *     responses:
 *       200:
 *         description: User suspended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User suspended for 3 days"
 *                 suspendedUntil:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-08-11T21:06:17.000Z"
 *       400:
 *         description: Invalid user ID format or suspension days out of range (must be 1-7)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin access required)
 *       404:
 *         description: User not found
 */
router.patch("/auth/:userId/suspend", protect, isAdmin, suspendUser);
export default router;
