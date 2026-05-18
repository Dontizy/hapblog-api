"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var userController_js_1 = require("../controllers/userController.js");
var authMiddleware_js_1 = require("../middleware/authMiddleware.js");
var authorizedUser_js_1 = require("../middleware/authorizedUser.js");
var router = (0, express_1.Router)();
/**
 * @openapi
 * /user/register:
 *   post:
 *     summary: Register a user
 *     description: This endpoint is used to create a new user account.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Required field
 *       409:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
router.post('/register', userController_js_1.register);
/**
 * @openapi
 * /user/login:
 *   post:
 *     summary: Login user
 *     description: This endpoint is used to login user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful
 *       400:
 *         description: Required field
 *       500:
 *         description: Server error
 */
router.post('/login', userController_js_1.login);
/**
 * @openapi
 * /user/{id}:
 *   delete:
 *     summary: Admin delete a user
 *     description: An admin delete a user and all blogs associated with the user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User and associated blogs deleted successfully
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Only admin allowed
 *       404:
 *         description: User not found
 */
router.delete('/delete/:id', authMiddleware_js_1.protect, authorizedUser_js_1.isAdmin, userController_js_1.deleteUser);
/**
 * @openapi
 * /user/all:
 *   get:
 *     summary: Get all users
 *     description: Retrieve all users (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Only admin allowed
 */
router.get('/all', authMiddleware_js_1.protect, authorizedUser_js_1.isAdmin, userController_js_1.allUsers);
/**
 * @openapi
 * /password/update:
 *   put:
 *     summary: Update user password
 *     description: Change the authenticated user's password
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Incorrect old password
 *       404:
 *         description: User not found
 */
router.put('/password/update', authMiddleware_js_1.protect, userController_js_1.changePassword);
/**
 * @swagger
 * /user/admin/{id}:
 *   patch:
 *     summary: Add or remove admin role
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 */
router.patch("/admin/:id", authMiddleware_js_1.protect, authorizedUser_js_1.isAdmin, userController_js_1.addOrRemoveAdmin);
/**
* @swagger
* /user/profile:
*   get:
*     summary: Get current user profile
*     tags:
*       - Users
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: User profile fetched successfully
*       404:
*         description: User not found
*/
router.get("/profile", authMiddleware_js_1.protect, userController_js_1.userProfile);
exports.default = router;
