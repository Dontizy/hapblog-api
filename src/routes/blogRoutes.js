"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var blogController_js_1 = require("../controllers/blogController.js");
var authMiddleware_js_1 = require("../middleware/authMiddleware.js");
var uploader_js_1 = require("../utils/uploader.js");
var authorizedUser_js_1 = require("../middleware/authorizedUser.js");
var router = (0, express_1.Router)();
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
router.post('/post', authMiddleware_js_1.protect, uploader_js_1.upload.single('image'), blogController_js_1.createBlogPost);
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
router.get('/posts', blogController_js_1.getAllBlogPost);
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
router.get('/post/:id', blogController_js_1.getBlogPost);
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
router.put('/post/:id', authMiddleware_js_1.protect, authorizedUser_js_1.isAuthorized, uploader_js_1.upload.single("image"), blogController_js_1.updateBlogPost);
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
router.delete('/post/:id', authMiddleware_js_1.protect, authorizedUser_js_1.isAuthorized, blogController_js_1.deleteBlogPost);
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
router.patch("/post/:id/like", authMiddleware_js_1.protect, blogController_js_1.toggleLikePost);
exports.default = router;
