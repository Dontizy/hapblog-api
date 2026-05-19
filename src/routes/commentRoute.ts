import {Router} from "express";
import {protect} from "../middleware/authMiddleware.js"
import {createComment} from "../controllers/commentController.js";

const router = Router()

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     summary: Get a single blog with comments
 *     tags: [Blogs]
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
// router.get("/")
 
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
export default router