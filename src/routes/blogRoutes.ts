import { Router } from "express";
import { createBlogPost, getAllBlogPost, getBlogPost, updateBlogPost, deleteBlogPost, toggleLikePost } from "../controllers/blogController.js";
import {toggleBookmark, getBookmarks} from "../controllers/bookmarkController.js"
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../utils/uploader.js";
import { isAuthorized } from "../middleware/authorizedUser.js";

const router = Router()
/**
 * @openapi
 * /blog/post:
 *   post:
 *     summary: Create a blog post
 *     description: Create a new blog post with image upload
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: My first blog post
 *               content:
 *                 type: string
 *                 example: This is the content of my blog post
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Blog post created successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router.post('/post', protect, upload.single('image'), createBlogPost)

/**
 * @openapi
 * /blog/posts:
 *   get:
 *     summary: Get all blog posts
 *     description: Retrieve all blog posts
 *     tags:
 *       - Blogs
 *     responses:
 *       200:
 *         description: Blog posts retrieved successfully
 *       500:
 *         description: Internal server error
 */

router.get('/posts', getAllBlogPost)

/**
 * @openapi
 * /blog/post/{id}:
 *   get:
 *     summary: Get a blog post
 *     description: Get a blog post by its ID
 *     tags:
 *       - Blogs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Blog post ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ok
 *       404:
 *         description: Blog post not found
 *     
 */
router.get('/post/:id', getBlogPost)

/**
 * @openapi
 * /blog/post/{id}:
 *   put:
 *     summary: Update a blog post
 *     description: Update a blog post by its ID
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Blog post ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated blog title
 *               content:
 *                 type: string
 *                 example: Updated blog content
 *               imageUrl:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Blog post updated successfully
 *       404:
 *         description: Blog post not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Action denied, only author and admin allowed
 */
router.put('/post/:id', protect, isAuthorized, upload.single("image"), updateBlogPost)

/**
 * @openapi
 * /blog/post/{id}:
 *   delete:
 *     summary: Delete a blog post
 *     description: Delete a blog post by its ID
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Blog post ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog post deleted successfully
 *       404:
 *         description: Blog post not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Action denied, only author and admin allowed
 * 
 */
router.delete('/post/:id', protect, isAuthorized, deleteBlogPost)

 /**
 * @swagger
 * /blog/post/{id}/like:
 *   patch:
 *     summary: Like or unlike a blog post
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Blog liked or unliked successfully
 *
 *       400:
 *         description: Invalid blog ID
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: Blog post not found
 */
 
 router.patch("/post/:id/like", protect, toggleLikePost)
 
  /**
 * @swagger
 * /blog/{id}/bookmark:
 *   patch:
 *     summary: Toggle bookmark on a blog post
 *     tags:
 *       - Blogs
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
 *         description: Bookmark toggled successfully
 *       400:
 *         description: Invalid blog id
 *       404:
 *         description: Blog or user not found
 */
 router.patch(
  "/:id/bookmark",
  protect,
  toggleBookmark
);

/**
 * @swagger
 * /blog/bookmarks:
 *   get:
 *     summary: Get authenticated user's bookmarked blog posts
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User bookmarks fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/bookmarks",
  protect,
  getBookmarks
);
export default router;

