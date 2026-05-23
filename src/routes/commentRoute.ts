import {Router} from "express";
import {protect} from "../middleware/authMiddleware.js"
import {createComment, fetchComments, updateComment, deleteComment, toggleLikeComment} from "../controllers/commentController.js";
import {isCommentAuthorOrAdmin, isCommentAuthor, isReplyAuthorOrAdmin, isReplyAuthor} from "../middleware/authorizedUser.js"
import { createReply, updateReply,toggleReplyLike, deleteReply } from "../controllers/replyController.js"

const router = Router()

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
router.get("/post/:id/comments", fetchComments)
 
 /**
 * @swagger
 * /blog/post/{id}/comment/:
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
router.post("/post/:id/comment", protect, createComment)

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

router.patch("/:id/comment/:commentId", protect, isCommentAuthor, updateComment)
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
 *
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *
 *       400:
 *         description: Invalid comment ID
 *
 *       404:
 *         description: Blog post or comment not found
 * 
 *       403:
 *         description: Permission denied, not author or admin
 *
 *       401:
 *         description: Unauthorized
 */
 
 
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
 *
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Comment liked or unliked successfully
 *
 *       400:
 *         description: Invalid blog post ID or comment ID
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: Blog post comment not found
 */
router.patch("/:id/comment/:commentId/like", protect, toggleLikeComment)

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
 
router.post("/comment/:commentId/reply", protect, createReply)

/**
 * @swagger
 * /blog/comment/{id}/reply/{replyId}:
 *   patch:
 *     summary: Update a reply
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
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Reply updated successfully
 *       404:
 *         description: Comment or reply not found
 *       400:
 *         description: Invalid ID
 */
 
router.patch("/comment/:id/reply/:replyId", protect, isReplyAuthor, updateReply)

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
 
 router.delete("/comment/:id/reply/:replyId", protect, isReplyAuthorOrAdmin, deleteReply)

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

 router.patch("/comment/:id/reply/:replyId/like", protect, toggleReplyLike)
export default router