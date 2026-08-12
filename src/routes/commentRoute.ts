import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createComment,
  fetchComments,
  updateComment,
  deleteComment,
  toggleLikeComment,
} from "../controllers/commentController.js";
import {
  isCommentAuthorOrAdmin,
  isCommentAuthor,
  isReplyAuthorOrAdmin,
  isReplyAuthor,
  checkSuspension,
} from "../middleware/authorizedUser.js";
import {
  createReply,
  updateReply,
  toggleReplyLike,
  deleteReply,
  fetchReplies,
} from "../controllers/replyController.js";
import { optionalUser } from "../middleware/optionalUser.js";

const router = Router();

/**
 * @swagger
 * /blog/post/{id}/comments:
 *   get:
 *     summary: Get a single blog with comments
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog fetched successfully
 *       400:
 *         description: Invalid blog ID
 *       404:
 *         description: Blog not found
 */
router.get("/post/:id/comments", optionalUser, fetchComments);

/**
 * @swagger
 * /blog/post/{id}/comment:
 *   post:
 *     summary: Create a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               body:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Blog not found
 */
router.post("/post/:id/comment", protect, checkSuspension, createComment);

/**
 * @swagger
 * /blog/{id}/comment/{commentId}:
 *   patch:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               body:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Permission denied, not author
 *       404:
 *         description: Comment or blog not found
 */
router.patch(
  "/:id/comment/:commentId",
  protect,
  isCommentAuthor,
  checkSuspension,
  updateComment,
);

/**
 * @swagger
 * /blog/{id}/comment/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       400:
 *         description: Invalid comment ID
 *       404:
 *         description: Blog post or comment not found
 *       403:
 *         description: Permission denied, not author or admin
 *       401:
 *         description: Unauthorized
 */
router.delete(
  "/:id/comment/:commentId",
  protect,
  isCommentAuthorOrAdmin,
  checkSuspension,
  deleteComment,
);

/**
 * @swagger
 * /blog/{id}/comment/{commentId}/like:
 *   patch:
 *     summary: Like or unlike a comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment liked or unliked successfully
 *       400:
 *         description: Invalid blog post ID or comment ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog post comment not found
 */
router.patch(
  "/:id/comment/:commentId/like",
  protect,
  checkSuspension,
  toggleLikeComment,
);

/**
 * @swagger
 * /blog/comment/{commentId}/reply:
 *   post:
 *     summary: Create a reply
 *     tags: [Replies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               body:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reply created successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Comment not found
 */
router.post("/comment/:commentId/reply", protect, checkSuspension, createReply);

/**
 * @openapi
 * /blog/comment/{id}/reply/{replyId}:
 *   patch:
 *     summary: Update an existing reply
 *     description: Updates the body content of a specific reply under a comment.
 *     tags:
 *       - Replies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the parent comment
 *         example: 650c1f1e2f3a4b5c6d7e8f90
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the reply to update
 *         example: 650c1f1e2f3a4b5c6d7e8f99
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *             properties:
 *               body:
 *                 type: string
 *                 description: The updated text content of the reply
 *                 example: "This is an updated reply message."
 *     responses:
 *       200:
 *         description: Reply updated successfully
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
 *                   example: "Reply updated"
 *                 reply:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 650c1f1e2f3a4b5c6d7e8f99
 *                     comment:
 *                       type: string
 *                       example: 650c1f1e2f3a4b5c6d7e8f90
 *                     author:
 *                       type: string
 *                       example: 650c1f1e2f3a4b5c6d7e8f11
 *                     body:
 *                       type: string
 *                       example: "This is an updated reply message."
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad Request — Invalid ObjectIDs or empty reply body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   examples:
 *                     invalidId:
 *                       value: "Invalid comment or reply id"
 *                     missingBody:
 *                       value: "Reply body is required"
 *       401:
 *         description: Unauthorized — Missing or invalid authentication token
 *       403:
 *         description: Forbidden — User is not the author or an admin
 *       404:
 *         description: Not Found — Comment or reply does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   examples:
 *                     commentNotFound:
 *                       value: "Comment not found"
 *                     replyNotFound:
 *                       value: "Reply not found"
 *       500:
 *         description: Internal Server Error
 */
router.patch(
  "/comment/:id/reply/:replyId",
  protect,
  isReplyAuthor,
  checkSuspension,
  updateReply,
);

/**
 * @swagger
 * /blog/comment/{id}/reply/{replyId}:
 *   delete:
 *     summary: Delete a reply
 *     tags: [Replies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reply deleted successfully
 *       404:
 *         description: Comment or reply not found
 */
router.delete(
  "/comment/:id/reply/:replyId",
  protect,
  isReplyAuthorOrAdmin,
  checkSuspension,
  deleteReply,
);

/**
 * @swagger
 * /blog/comment/{id}/reply/{replyId}/like:
 *   patch:
 *     summary: Like or unlike a reply
 *     tags: [Replies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reply like status updated
 *       404:
 *         description: Reply not found
 */
router.patch(
  "/comment/:id/reply/:replyId/like",
  protect,
  checkSuspension,
  toggleReplyLike,
);

/**
 * @swagger
 * /blog/comment/{commentId}/replies:
 *   get:
 *     summary: Get replies for a comment
 *     tags: [Replies]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Replies fetched successfully
 *       400:
 *         description: Invalid comment ID
 *       404:
 *         description: Comment not found
 */
router.get("/comment/:commentId/replies", optionalUser, fetchReplies);

export default router;
