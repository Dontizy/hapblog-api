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
  getUserPosts,
  getDraft,
  searchAuthors
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/authorizedUser.js";
import { upload } from "../utils/uploader.js";
import {
  getNotifications,
  markNotificationAsRead
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
 *                 type: string
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
 *         description: Authentication required
 *       403:
 *         description: "Forbidden: administrator access required"
 *       404:
 *         description: User not found
 */
router.delete("/auth/delete/:id", protect, isAdmin, deleteUser);

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Retrieve all users or search users
 *     description: >
 *       Retrieves a list of users sorted by creation date (newest first).
 *       Supports optional search filtering across username, email, registration year (e.g., "2026"),
 *       or registration month (1–12 for the current year).
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Term to search by username, email, year (YYYY), or month (1-12)
 *         example: "john"
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized — Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               status: fail
 *               message: "Authentication required"
 *       403:
 *         description: Forbidden — Administrator access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               status: fail
 *               message: "Forbidden: administrator access required"
 */
router.get("/admin/users", protect, isAdmin, allUsers);

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
 *       - Admin
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
 *       401:
 *         description: Authentication required
 *       403:
 *         description: "Forbidden: administrator access required"
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
 * /user/auth/{username}/followers:
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
router.get("/auth/:username/followers", protect, publicUserFollowers);

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
 * /user/auth/{userId}/follow:
 *   patch:
 *     summary: Follow or unfollow a user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Follow status toggled successfully
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.patch("/auth/:userId/follow", protect, followUser);

/**
 * @openapi
 * /user/admin/broadcast:
 *   post:
 *     summary: Broadcast notification to all users
 *     tags:
 *       - Admin
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
 *         description: Authentication required
 *       403:
 *         description: "Forbidden: administrator access required"
 *       404:
 *         description: No users found
 */
router.post(
  "/admin/broadcast",
  protect,
  isAdmin,
  broadcastNotification,
);

/**
 * @openapi
 * /user/admin/{userId}/suspend:
 *   patch:
 *     summary: Suspend a user account
 *     description: Allows an administrator to suspend a user account for a duration between 1 and 7 days. Sends a notification to the suspended user.
 *     tags:
 *       - Admin / Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: 650f123456789abcdef01234
 *         description: Valid 24-character MongoDB ObjectId of the target user
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
 *                 description: Number of days to suspend the user (must be an integer from 1 to 7)
 *     responses:
 *       200:
 *         description: User successfully suspended
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
 *                   example: User suspended for 3 days.
 *                 suspendedUntil:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-08-17T11:20:38.000Z"
 *       400:
 *         description: Bad Request — Invalid user ID format or invalid suspension duration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidUserId:
 *                 summary: Invalid User ID format
 *                 value:
 *                   success: false
 *                   status: fail
 *                   message: "Invalid user ID"
 *               invalidDays:
 *                 summary: Invalid suspension duration
 *                 value:
 *                   success: false
 *                   status: fail
 *                   message: "Suspension duration must be between 1 and 7 days"
 *       401:
 *         description: Unauthorized — Authentication token is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               status: fail
 *               message: "Authentication required"
 *       403:
 *         description: Forbidden — Administrator access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               status: fail
 *               message: "Forbidden: administrator access required"
 *       404:
 *         description: Not Found — Target user does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               status: fail
 *               message: "User not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               status: error
 *               message: "Internal server error"
 */
router.patch("/admin/:userId/suspend", protect, isAdmin, suspendUser)


/**
 * @openapi
 * /user/search-authors:
 *   get:
 *     summary: Search for authors by username or name
 *     description: Searches for registered users matching a search query string against their username or name (case-insensitive). Returns up to 20 matching authors sorted alphabetically.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search term to match against author's username or name
 *         example: "john"
 *     responses:
 *       200:
 *         description: List of matching authors retrieved successfully (returns an empty array if search query is empty)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 authors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "6680a1b2c3d4e5f678901234"
 *                       username:
 *                         type: string
 *                         example: "johndoe"
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       avatar:
 *                         type: string
 *                         nullable: true
 *                         example: "https://example.com/avatar.jpg"
 */
router.get("/search-authors", protect, searchAuthors)

/**
 * @openapi
 * /user/blogs:
 *   get:
 *     summary: Get all posts created by the authenticated user
 *     description: Retrieves all blog posts (drafts and published) authored by the currently logged-in user, sorted by newest first.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Blog'
 *       401:
 *         description: Unauthorized — Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               status: fail
 *               message: "Unauthorized"
 */
router.get("/my-posts", protect, getUserPosts);

/**
 * @openapi
 * /api/blogs/drafts:
 *   get:
 *     summary: Get all drafts for the logged-in user
 *     tags:
 *       - Drafts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of drafts returned successfully
 *       401:
 *         description: Unauthorized — Authentication required
 */
router.get('/drafts', protect, getDraft)

export default router;
