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
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/authorizedUser.js";
import { upload } from "../utils/uploader.js";
import {
  getNotifications,
  markNotificationAsRead,
  openNotification,
} from "../controllers/notificationController.js";

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
 *               - email
 *               - name
 *               - password
 *             properties:
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
 *     description: This endpoint is used to login user
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
 *               - password
 *             properties:
 *               email:
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
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
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
 * @swagger
 * /user/auth/{userId}/follow:
 *   patch:
 *     summary: Follow or unfollow a user
 *     description: Toggles the follow status between the authenticated user and the target user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to follow or unfollow
 *     responses:
 *       200:
 *         description: Follow status updated successfully
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
 *                   example: You are now following John Doe
 *       400:
 *         description: Invalid user ID or attempting to follow yourself
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch("/auth/:userId/follow", protect, followUser);

/**
 * @swagger
 * /user/auth/{userId}:
 *   get:
 *     summary: Get a user profile
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
router.get("/auth/:userId", protect, getUserProfile);
export default router;
