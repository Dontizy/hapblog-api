import { Router } from "express";
import {
  createBlogPost,
  getAllBlogPost,
  getBlogPost,
  updateBlogPost,
  deleteBlogPost,
  toggleLikePost,
  publishBlogPost,
  getMyDrafts,
} from "../controllers/blogController.js";
import {
  toggleBookmark,
  getBookmarks,
} from "../controllers/bookmarkController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../utils/uploader.js";
import { isBlogAuthorOrAdmin } from "../middleware/authorizedUser.js";
import { checkSuspension } from "../middleware/authorizedUser.js";
import { optionalUser } from "../middleware/optionalUser.js";

const router = Router();

/**
 * @openapi
 * /blog/post:
 *   post:
 *     summary: Create a blog post
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
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My First Blog Post"
 *               content:
 *                 type: string
 *                 example: "This is the content of my blog post."
 *               category:
 *                 type: string
 *                 enum:
 *                   - Technology
 *                   - Programming
 *                   - Web Development
 *                   - Mobile Development
 *                   - Artificial Intelligence
 *                   - Cybersecurity
 *                   - Data Science
 *                   - Business
 *                   - Finance
 *                   - Education
 *                   - Lifestyle
 *                   - Health
 *                   - Fitness
 *                   - Travel
 *                   - Food
 *                   - Entertainment
 *                   - Sports
 *                   - Gaming
 *                   - Movies
 *                   - Music
 *                   - Fashion
 *                   - Science
 *                   - Politics
 *                   - News
 *                   - Opinion
 *                   - Other
 *                 example: "Technology"
 *               status:
 *                 type: string
 *                 enum:
 *                   - draft
 *                   - published
 *                 default: "draft"
 *                 example: "draft"
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Blog post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 blog:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "65f1a2b3c4d5e6f7a8b9c0d1"
 *                     title:
 *                       type: string
 *                       example: "My First Blog Post"
 *                     content:
 *                       type: string
 *                       example: "This is the content of my blog post."
 *                     category:
 *                       type: string
 *                       example: "Technology"
 *                     status:
 *                       type: string
 *                       enum:
 *                         - draft
 *                         - published
 *                       example: "draft"
 *                     imageUrl:
 *                       type: string
 *                       example: "https://example.com/image.jpg"
 *                     author:
 *                       type: string
 *                       example: "65f1a2b3c4d5e6f7a8b9c0d1"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Title, Content, or Category missing
 *       401:
 *         description: Not authorized
 */
router.post(
  "/post",
  protect,
  upload.single("image"),
  createBlogPost,
);

/**
 * @openapi
 * /blog/posts:
 *   get:
 *     summary: Get all published blog posts
 *     tags:
 *       - Blogs
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         example: "React"
 *         description: Search by title, content, or category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         example: 10
 *     responses:
 *       200:
 *         description: Blog posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 blogs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "6a70b314cf50f428e7902008"
 *                       title:
 *                         type: string
 *                         example: "Getting Started with React"
 *                       content:
 *                         type: string
 *                         example: "React is a popular JavaScript library..."
 *                       category:
 *                         type: string
 *                         example: "Web Development"
 *                       status:
 *                         type: string
 *                         example: "published"
 *                       imageUrl:
 *                         type: string
 *                         example: "https://example.com/image.jpg"
 *                       author:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                             example: "johndoe"
 *                           avatar:
 *                             type: string
 *                             example: "https://example.com/avatar.jpg"
 *                           bio:
 *                             type: string
 *                             example: "Full stack developer"
 *                       commentsCount:
 *                         type: integer
 *                         example: 12
 *                       isLiked:
 *                         type: boolean
 *                         example: false
 *                       isBookmarked:
 *                         type: boolean
 *                         example: true
 *                       readingTime:
 *                         type: integer
 *                         example: 4
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 totalBlogs:
 *                   type: integer
 *                   example: 42
 *                 limit:
 *                   type: integer
 *                   example: 10
 */
router.get("/posts", optionalUser, getAllBlogPost);

/**
 * @openapi
 * /blog/post/{id}:
 *   get:
 *     summary: Get single blog post by ID
 *     tags:
 *       - Blogs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "6a70b314cf50f428e7902008"
 *         description: Blog post ID
 *     responses:
 *       200:
 *         description: Blog post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 blog:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "6a70b314cf50f428e7902008"
 *                     title:
 *                       type: string
 *                       example: "Getting Started with React"
 *                     content:
 *                       type: string
 *                       example: "React is a popular JavaScript library..."
 *                     category:
 *                       type: string
 *                       example: "Web Development"
 *                     status:
 *                       type: string
 *                       example: "published"
 *                     imageUrl:
 *                       type: string
 *                       example: "https://example.com/image.jpg"
 *                     author:
 *                       type: object
 *                       properties:
 *                         username:
 *                           type: string
 *                           example: "johndoe"
 *                         avatar:
 *                           type: string
 *                           example: "https://example.com/avatar.jpg"
 *                         bio:
 *                           type: string
 *                           example: "Full stack developer"
 *                     commentsCount:
 *                       type: integer
 *                       example: 12
 *                     isLiked:
 *                       type: boolean
 *                       example: false
 *                     isBookmarked:
 *                       type: boolean
 *                       example: true
 *                     readingTime:
 *                       type: integer
 *                       example: 4
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid blog ID format
 *       404:
 *         description: Post not found
 */
router.get("/post/:id", optionalUser, getBlogPost);
/**
 * @openapi
 * /blog/post/{id}:
 *   put:
 *     summary: Update a blog post
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
 *         example: "6a70b314cf50f428e7902008"
 *         description: Blog post ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Blog Title"
 *               content:
 *                 type: string
 *                 example: "Updated content of the blog post."
 *               category:
 *                 type: string
 *                 enum:
 *                   - Technology
 *                   - Programming
 *                   - AI
 *                   - Business
 *                   - Design
 *                   - Lifestyle
 *                   - Health
 *                   - Education
 *                   - Travel
 *                   - Sports
 *                   - Entertainment
 *                   - News
 *                   - Finance
 *                   - Food
 *                   - Politics
 *                   - Web Development
 *                   - Mobile Development
 *                   - Cybersecurity
 *                   - Data Science
 *                   - Science
 *                   - Movies
 *                   - Games
 *                   - Fashion
 *                   - Opinion
 *                   - Fitness
 *                   - Other
 *                   - Music
 *                 example: "Programming"
 *               status:
 *                 type: string
 *                 enum:
 *                   - draft
 *                   - published
 *                 example: "published"
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Blog post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 blog:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "6a70b314cf50f428e7902008"
 *                     title:
 *                       type: string
 *                       example: "Updated Blog Title"
 *                     content:
 *                       type: string
 *                       example: "Updated content of the blog post."
 *                     category:
 *                       type: string
 *                       example: "Programming"
 *                     status:
 *                       type: string
 *                       enum:
 *                         - draft
 *                         - published
 *                       example: "published"
 *                     imageUrl:
 *                       type: string
 *                       example: "https://example.com/image.jpg"
 *                     author:
 *                       type: string
 *                       example: "65f1a2b3c4d5e6f7a8b9c0d1"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid blog post ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: "Forbidden — not the post's author/admin, or the account is suspended"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               AdministratorAccess:
 *                 summary: Not the author or an admin
 *                 value:
 *                   success: false
 *                   status: fail
 *                   message: "Forbidden: administrator access required"
 *               suspended:
 *                 summary: Account is suspended
 *                 value:
 *                   success: false
 *                   status: fail
 *                   message: "Account is currently suspended"
 *       404:
 *         description: Blog post not found
 */
router.put(
  "/post/:id",
  protect,
  isBlogAuthorOrAdmin,
  checkSuspension,
  upload.single("image"),
  updateBlogPost,
);

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
 *       400:
 *         description: Invalid blog post ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: "Forbidden — not the post's author/admin, or the account is suspended"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               AdministratorAccess:
 *                 summary: Not the author or an admin
 *                 value:
 *                   success: false
 *                   status: fail
 *                   message: "Forbidden: administrator access required"
 *               suspended:
 *                 summary: Account is suspended
 *                 value:
 *                   success: false
 *                   status: fail
 *                   message: "Account is currently suspended"
 *       404:
 *         description: Blog post not found
 */
router.delete(
  "/post/:id",
  protect,
  isBlogAuthorOrAdmin,
  checkSuspension,
  deleteBlogPost,
);

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
 *     responses:
 *       200:
 *         description: Blog liked or unliked successfully
 *       400:
 *         description: Invalid blog ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Account is currently suspended
 *       404:
 *         description: Blog post not found
 */
router.patch("/post/:id/like", protect, checkSuspension, toggleLikePost);

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
router.patch("/:id/bookmark", protect, toggleBookmark);

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
router.get("/bookmarks", protect, getBookmarks);

/**
 * @openapi
 * /blog/post/{id}/publish:
 *   patch:
 *     summary: Publish a draft blog post
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
 *         example: "6a70b314cf50f428e7902008"
 *         description: Blog post ID
 *     responses:
 *       200:
 *         description: Post published successfully
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
 *                   example: "Post published successfully"
 *                 blog:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "6a70b314cf50f428e7902008"
 *                     title:
 *                       type: string
 *                       example: "My published blog post"
 *                     content:
 *                       type: string
 *                       example: "This is my published content..."
 *                     category:
 *                       type: string
 *                       example: "Technology"
 *                     status:
 *                       type: string
 *                       enum:
 *                         - draft
 *                         - published
 *                       example: "published"
 *                     imageUrl:
 *                       type: string
 *                       example: "https://example.com/image.jpg"
 *                     author:
 *                       type: string
 *                       example: "65f1a2b3c4d5e6f7a8b9c0d1"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid blog post ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: "Forbidden — not the post's author/admin, or the account is suspended"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               AdministratorAccess:
 *                 summary: Not the author or an admin
 *                 value:
 *                   success: false
 *                   status: fail
 *                   message: "Forbidden: administrator access required"
 *               suspended:
 *                 summary: Account is suspended
 *                 value:
 *                   success: false
 *                   status: fail
 *                   message: "Account is currently suspended"
 *       404:
 *         description: Blog post not found
 */
router.patch("/post/:id/publish", protect, isBlogAuthorOrAdmin, checkSuspension, publishBlogPost);


/**
 * @openapi
 * /blog/drafts:
 *   get:
 *     summary: Get authenticated user's draft posts
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Draft posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 drafts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "6a70b314cf50f428e7902008"
 *                       title:
 *                         type: string
 *                         example: "My unfinished blog post"
 *                       content:
 *                         type: string
 *                         example: "This is my draft content..."
 *                       category:
 *                         type: string
 *                         example: "Technology"
 *                       status:
 *                         type: string
 *                         enum:
 *                           - draft
 *                           - published
 *                         example: "draft"
 *                       imageUrl:
 *                         type: string
 *                         example: "https://example.com/image.jpg"
 *                       author:
 *                         type: object
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get("/drafts", protect, getMyDrafts);


export default router;
