"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var authMiddleware_js_1 = require("../middleware/authMiddleware.js");
var commentController_js_1 = require("../controllers/commentController.js");
var router = (0, express_1.Router)();
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
router.post("/:id/comment", authMiddleware_js_1.protect, commentController_js_1.createComment);
exports.default = router;
