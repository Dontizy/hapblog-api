import {Router} from "express";
import {protect} from "../middleware/authMiddleware.js"
import {createComment, fetchComments, updateComment, deleteComment, toggleLikeComment} from "../controllers/commentController.js";
import {isCommentAuthorOrAdmin, isCommentAuthor} from "../middleware/authorizedUser.js"

const router = Router()

/**
 * @swagger
 * /blog/{id}/comments:
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
router.get("/:id/comments", fetchComments)
 
 /**
 * @swagger
 * /blog/{id}/comment/:
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
router.post("/:id/comment", protect, createComment)

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
 *       401:
 *         description: Unauthorized
 */
 router.delete("/:id/comment/:commentId", protect, isCommentAuthorOrAdmin, deleteComment)
 
/**
 * @swagger
 * /blog/{id}/comments/{commentId}/like:
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
export default router