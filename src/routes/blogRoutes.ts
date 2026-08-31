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
  uploadContentImage,
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
 *                 example: Building Scalable Node.js APIs
 *               content:
 *                 type: string
 *                 example: In this article, we will explore best practices for Express.js...
 *               category:
 *                 type: string
 *                 description: Valid MongoDB ObjectId of the category. Required if status is "published".
 *                 example: 60d5ecb8b5c9c62b3c7c8b45
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 default: draft
 *                 example: published
 *               file:
 *                 type: string
 *                 format: binary
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
 *       400:
 *         description: Bad request - Missing title/content, invalid status, missing required category when publishing, or invalid category ID.
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
 *       403:
 *         description: Forbidden - Suspended user attempting to publish a post.
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
 *         description: Search by title, content, or category
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
 *         description: Blog posts retrieved successfully
 */
router.get("/posts", optionalUser, getAllBlogPost);

/**
 * @openapi
 * /blog/post/{slug}:
 *   get:
 *     summary: Get single blog post by slug
 *     description: >
 *       Fetches a single blog post by its slug. Published posts are visible
 *       to everyone; draft posts are only visible to their author, and a
 *       draft requested by anyone else returns 404 rather than 403 so its
 *       existence isn't revealed to unauthorized visitors.
 *     tags:
 *       - Blogs
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: "getting-started-with-react"
 *         description: Blog post slug
 *     responses:
 *       200:
 *         description: Blog post retrieved successfully
 *       404:
 *         description: >
 *           Post does not exist, is a draft not owned by the requester,
 *           or is a draft requested while unauthenticated
 */
router.get("/post/:slug", optionalUser, getBlogPost);

/**
 * @openapi
 * /blog/post/{id}:
 *   put:
 *     summary: Update an existing blog post
 *     description: Updates the title, content, category, status, or featured image of a blog post by its ID. Suspended users cannot change status to published.
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
 *     responses:
 *       200:
 *         description: Blog post updated successfully.
 *       400:
 *         description: Validation error (e.g., invalid blog/category ID, empty title/content, or invalid status value).
 *       403:
 *         description: Forbidden - Suspended user attempting to publish a post.
 *       404:
 *         description: Blog post or specified category not found.
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
 *         description: Blog post deleted successfully
 *       400:
 *         description: Invalid blog post ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: "Forbidden — not the post's author/admin, or the account is suspended"
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
 * @openapi
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
 * @openapi
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
 * @openapi
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
 *     responses:
 *       200:
 *         description: Post published successfully
 *       400:
 *         description: Invalid blog post ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: "Forbidden — not the post's author/admin, or the account is suspended"
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
 * /blog/drafts:
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
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *     responses:
 *       200:
 *         description: Successfully retrieved user's draft blog posts.
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
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
 *                 example: Web Development
 *               description:
 *                 type: string
 *                 example: Articles and resources related to web development technologies.
 *     responses:
 *       201:
 *         description: Category created successfully.
 *       400:
 *         description: Bad Request - Missing category name or invalid name resulting in an empty slug.
 *       401:
 *         description: Unauthorized - Authentication token missing or invalid.
 *       403:
 *         description: Forbidden - User is authenticated but does not have the "admin" role.
 *       409:
 *         description: Conflict - A category with the provided name or generated slug already exists.
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully.
 *       401:
 *         description: Unauthorized - missing or invalid authentication token.
 *       500:
 *         description: Internal server error.
 */
router.get("/get-category", protect, getCategories);

/**
 * @swagger
 * /blog/upload-content-image:
 *   post:
 *     summary: Upload an image for blog content
 *     description: Uploads an inline blog image to Cloudinary. The returned URL can be inserted into Tiptap content, while the publicId can be stored with the blog for later image cleanup.
 *     tags:
 *       - Blog
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image to upload.
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 url:
 *                   type: string
 *                   format: uri
 *                   example: https://res.cloudinary.com/example/image/upload/v1234567890/Hapblog/blog-content/example.jpg
 *                 publicId:
 *                   type: string
 *                   example: Hapblog/blog-content/example
 *
 *       400:
 *         description: No image was provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *       500:
 *         description: Failed to upload image
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/upload-content-image",
  protect,
  upload.single("image"),
  uploadContentImage,
);

export default router;
