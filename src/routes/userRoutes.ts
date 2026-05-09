import { Router } from "express";
import {register,login} from '../controllers/userController.js'

const router = Router();

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
router.post('/register', register);


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
router.post('/login', login)


export default router