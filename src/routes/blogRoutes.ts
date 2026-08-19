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
import { isAdmin, isBlogAuthorOrAdmin } from "../middleware/authorizedUser.js";
import { checkSuspension } from "../middleware/authorizedUser.js";
import { optionalUser } from "../middleware/optionalUser.js";
import {
  createCategory,
  getCategories,
} from "../controllers/categoryController.js";

const router = Router();

/**
 * @openapi
 * /blog/post:
 *   post:
 *     summary: Create a new blog post
 *     description: Creates a new blog post as either a draft or published post. Supports image uploading via Cloudinary using multipart/form-data. Published posts require a valid category. Suspended users are restricted from publishing.
 *     tags:
 *       - Posts
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
 *                 description: Title of the blog post.
 *                 example: Building Scalable Node.js APIs
 *               content:
 *                 type: string
 *                 description: Main content of the blog post.
 *                 example: In this article, we will explore best practices for Express.js...
 *               category:
 *                 type: string
 *                 description: Valid MongoDB ObjectId of the category. Required if status is "published".
 *                 example: 60d5ecb8b5c9c62b3c7c8b45
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 default: draft
 *                 description: Publication status of the post.
 *                 example: published
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Cover image file to upload for the post.
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: Building Scalable Node.js APIs
 *               content:
 *                 type: string
 *                 example: In this article, we will explore best practices for Express.js...
 *               category:
 *                 type: string
 *                 example: 60d5ecb8b5c9c62b3c7c8b45
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 default: draft
 *                 example: published
 *     responses:
 *       201:
 *         description: Blog post created successfully.
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
 *                       example: 65123abc4567def890123456
 *                     title:
 *                       type: string
 *                       example: Building Scalable Node.js APIs
 *                     content:
 *                       type: string
 *                       example: In this article, we will explore best practices for Express.js...
 *                     category:
 *                       type: string
 *                       nullable: true
 *                       example: 60d5ecb8b5c9c62b3c7c8b45
 *                     author:
 *                       type: string
 *                       example: 60d5ecb8b5c9c62b3c7c8b11
 *                     status:
 *                       type: string
 *                       enum: [draft, published]
 *                       example: published
 *                     imageUrl:
 *                       type: string
 *                       nullable: true
 *                       example: https://res.cloudinary.com/demo/image/upload/sample.jpg
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-08-18T11:08:20.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-08-18T11:08:20.000Z
 *       400:
 *         description: Bad request - Missing title/content, invalid status, missing required category when publishing, or invalid category ID.
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
 *                   example: A category is required when publishing a post
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                   example: Not authorized
 *       403:
 *         description: Forbidden - Suspended user attempting to publish a post.
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
 *                   example: Suspended users cannot publish posts
 *       500:
 *         description: Internal server error.
 */
router.post("/post", protect, upload.single("image"), createBlogPost);

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
 *     summary: Update an existing blog post
 *     description: Updates the title, content, category, status, or featured image of a blog post by its ID. Supports multipart form-data for image upload. Suspended users cannot change status to published.
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Valid MongoDB ObjectId of the blog post.
 *         example: 65123abc4567def890123456
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Updated blog post title.
 *                 example: Updated Blog Post Title
 *               content:
 *                 type: string
 *                 description: Updated blog post main content.
 *                 example: Updated content of the blog post...
 *               category:
 *                 type: string
 *                 description: Valid MongoDB ObjectId of the target category.
 *                 example: 60d5ecb8b5c9c62b3c7c8b45
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 description: Publication status of the post.
 *                 example: published
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload as the blog post cover image.
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Blog Post Title
 *               content:
 *                 type: string
 *                 example: Updated content of the blog post...
 *               category:
 *                 type: string
 *                 example: 60d5ecb8b5c9c62b3c7c8b45
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 example: published
 *     responses:
 *       200:
 *         description: Blog post updated successfully.
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
 *                       example: 65123abc4567def890123456
 *                     title:
 *                       type: string
 *                       example: Updated Blog Post Title
 *                     content:
 *                       type: string
 *                       example: Updated content of the blog post...
 *                     category:
 *                       type: string
 *                       example: 60d5ecb8b5c9c62b3c7c8b45
 *                     status:
 *                       type: string
 *                       enum: [draft, published]
 *                       example: published
 *                     imageUrl:
 *                       type: string
 *                       nullable: true
 *                       example: https://res.cloudinary.com/demo/image/upload/sample.jpg
 *                     author:
 *                       type: string
 *                       example: 60d5ecb8b5c9c62b3c7c8b45
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-03-15T10:30:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-03-15T12:00:00.000Z
 *       400:
 *         description: Validation error (e.g., invalid blog/category ID, empty title/content, or invalid status value).
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
 *                   example: Title can't be empty
 *       403:
 *         description: Forbidden - Suspended user attempting to publish a post.
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
 *                   example: Suspended users cannot publish posts
 *       404:
 *         description: Blog post or specified category not found.
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
 *                   example: Post not found
 *       500:
 *         description: Internal server error.
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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "Forbidden: administrator access required"
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
router.patch(
  "/post/:id/publish",
  protect,
  isBlogAuthorOrAdmin,
  checkSuspension,
  publishBlogPost,
);

/**
 * @openapi
 * /user/drafts:
 *   get:
 *     summary: Get authenticated user's draft blog posts
 *     description: Fetches a paginated list of draft blog posts created by the currently authenticated user, sorted by last updated date descending.
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination.
 *         example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *         description: Number of drafts to return per page (capped at 50).
 *         example: 10
 *     responses:
 *       200:
 *         description: Successfully retrieved user's draft blog posts.
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
 *                         example: 65123abc4567def890123456
 *                       title:
 *                         type: string
 *                         example: Work in Progress - Article Draft
 *                       content:
 *                         type: string
 *                         example: Draft content goes here...
 *                       status:
 *                         type: string
 *                         example: draft
 *                       author:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 60d5ecb8b5c9c62b3c7c8b45
 *                           username:
 *                             type: string
 *                             example: janedoe
 *                           name:
 *                             type: string
 *                             example: Jane Doe
 *                           avatar:
 *                             type: string
 *                             nullable: true
 *                             example: https://example.com/avatar.png
 *                           bio:
 *                             type: string
 *                             nullable: true
 *                             example: Tech enthusiast and writer.
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-03-15T10:30:00.000Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-03-15T11:45:00.000Z
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalDrafts:
 *                       type: integer
 *                       example: 5
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                   example: Not authorized
 *       500:
 *         description: Internal server error.
 */
router.get("/drafts", protect, getMyDrafts);

/**
 * @openapi
 * /blog/create-category:
 *   post:
 *     summary: Create a new category
 *     description: Creates a new category with an automatically generated slug. Only accessible by authenticated administrator users.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the category.
 *                 example: Web Development
 *               description:
 *                 type: string
 *                 description: Optional description of the category.
 *                 example: Articles and resources related to web development technologies.
 *     responses:
 *       201:
 *         description: Category created successfully.
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
 *                   example: Category created successfully
 *                 category:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 60d5ecb8b5c9c62b3c7c8b45
 *                     name:
 *                       type: string
 *                       example: Web Development
 *                     slug:
 *                       type: string
 *                       example: web-development
 *                     description:
 *                       type: string
 *                       example: Articles and resources related to web development technologies.
 *                     createdBy:
 *                       type: string
 *                       example: 60d5ecb8b5c9c62b3c7c8b11
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-08-18T11:12:40.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-08-18T11:12:40.000Z
 *       400:
 *         description: Bad Request - Missing category name or invalid name resulting in an empty slug.
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
 *                   example: Category name is required
 *       401:
 *         description: Unauthorized - Authentication token missing or invalid.
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
 *                   example: Authentication required
 *       403:
 *         description: Forbidden - User is authenticated but does not have the "admin" role.
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
 *                   example: Only administrators can create categories
 *       409:
 *         description: Conflict - A category with the provided name or generated slug already exists.
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
 *                   example: Category already exists
 *       500:
 *         description: Internal server error.
 */
router.post("/create-category", protect, isAdmin, createCategory);

/**
 * @openapi
 * /blog/get-category:
 *   get:
 *     summary: Retrieve all categories
 *     description: Fetch a list of all blog categories sorted alphabetically by name. Response is cached for 5 minutes.
 *     tags:
 *       - Categories
 *     responses:
 *       200:
 *         description: Categories retrieved successfully.
 *         headers:
 *           Cache-Control:
 *             schema:
 *               type: string
 *               example: public, max-age=300, s-maxage=600
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       500:
 *         description: Internal server error.
 */
router.get("/get-category", protect, getCategories);


export default router;
