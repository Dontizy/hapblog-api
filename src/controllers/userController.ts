import type { Response, Request } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { registerType, loginType } from '../types/userTypes.js';
import { User } from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import mongoose from 'mongoose';
import Blog from '../models/Blog.js';
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import { UploadApiResponse } from "cloudinary";
import { v2 as cloudinary } from "cloudinary";


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
    const user = await User.findOne({ email: emailLowercase }).select("+password")
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

export const allUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await User.find().sort({ createdAt: -1 })
    return res.status(200).json({
        success: true,
        users
    })
})


export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string }
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError('Invalid user id', 400)
    }
    const user = await User.findById(id)
    if (!user) {
        throw new AppError("User not found", 404)
    }
    await user.deleteOne()
    return res.status(200).json({
        success: true,
        message: "User and associated blogs deleted successfully",
    })
})


export const changePassword = asyncHandler(async (req: Request<{}, {}, { newPassword: string, oldPassword: string }>, res: Response) => {
    const id = req.user?._id;
    const { newPassword, oldPassword } = req.body

    if (!id) {
        throw new AppError("Not authorized", 401);
    }

    if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid user id", 400)
    }
    const user = await User.findById(id).select("+password")
    if (!user) {
        throw new AppError("User does not exist", 404)
    }
    if (!oldPassword || !newPassword) {
        throw new AppError("All fields are required", 400);
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) {
        throw new AppError('Incorrect old password!', 403)
    }
    const samePassword = await bcrypt.compare(newPassword, user.password)
    if (samePassword) {
        throw new AppError(
            "New password must be different",
            400
        );
    }
    user.password = await hashPassword(newPassword)
    await user.save()
    res.status(200).json({ success: true, message: 'Password updated' })
})

export const addOrRemoveAdmin = asyncHandler(async(req:Request, res:Response)=>{
  const {id} = req.params as { id:string}
  if(!mongoose.isValidObjectId(id)){
    throw new AppError("Invalid user ID",400)
  }
  const user = await User.findById(id)
  
  if(!user){
    throw new AppError("User not found", 404)
  }
  if(req.user?._id.toString() === id){
    throw new AppError("You cannot change your own role", 403)
  }
  if(user.role === "user"){
    user.role = "admin"
  }else{
    user.role = "user"
  }
  await user.save()
return res.status(200).json({
  success:true,
  user,
  role:user.role
})
})

export const userProfile = asyncHandler(async(req:Request, res:Response)=>{
  const user = req.user
  if(!user){
    throw new AppError("User not found", 404)
  }
  const userData ={
    id:user._id,
    name:user.name,
    email:user.email,
    role:user.role,
    avatar:user.avatar
  }
  return res.status(200).json({user:userData})
})

export const avatarUpdate = asyncHandler(async(req:Request, res:Response)=>{
  const id =req.user?._id
  if(!mongoose.isValidObjectId(id)){
    throw new AppError("Invalid user ID", 400)
  }
  const user = await User.findById(id)
  if(!user){
    throw new AppError("User not found", 404)
  }
  
  if (!req.file) {
      throw new AppError("Please upload an image", 400);
    }
if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }
    const upload = (await uploadToCloudinary(req.file)) as UploadApiResponse;
    user.avatar = upload.secure_url;
    user.avatarPublicId = upload.public_id;

  await user.save();
  return res.status(200).json({
    success:true,
    user
  })
})