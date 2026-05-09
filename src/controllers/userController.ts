import type { Response, Request } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { registerType, loginType } from '../types/userTypes.js';
import { User } from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

const hashPassword = async (plainPassword: string) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plainPassword, salt);
};

//Register controller
export const register = asyncHandler(async (req: Request<{}, {}, registerType>, res: Response) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) throw new AppError("All fields are required", 400);
    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(normalizedEmail)) throw new AppError("Please add a valid email", 400);
    const userExist = await User.findOne({ email: normalizedEmail })
    if (userExist) throw new AppError("User already exists, login", 409);
    const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: await hashPassword(password),
    })
    const secret = process.env.JWT_SECRET
    if (!secret) throw new AppError("Server configuration error", 500);
    const token = jwt.sign({ id: String(user._id) }, secret, { expiresIn: '1d' })
    return res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, }, token })
})


//login controller
export const login = asyncHandler(async (req: Request<{}, {}, loginType>, res: Response) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new AppError("Invalid credentials: email and password are required", 400)
    }
    const emailLowercase = email.trim().toLowerCase();
    const user = await User.findOne({ email: emailLowercase })
    if (!user) {
        throw new AppError("Invalid credentials", 401)
    }
    const checkPassword = await bcrypt.compare(password, user.password)
    if (!checkPassword) {
        throw new AppError("Invalid credentials", 401)
    }
    const secret = process.env.JWT_SECRET
    if (!secret) {
        throw new AppError("Server configuration error", 500);
    }
    const token = jwt.sign({ id: String(user._id) }, secret, { expiresIn: '1d' })
    return res.status(200).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token })
})