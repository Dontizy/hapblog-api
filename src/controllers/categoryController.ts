import { Request, Response } from "express";

import Category from "../models/Category.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createSlug } from "../utils/createSlug.js";

export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const admin = req.user;

    if (!admin) {
      throw new AppError("Authentication required", 401);
    }

    if (admin.role !== "admin") {
      throw new AppError("Only administrators can create categories", 403);
    }

    const { name, description } = req.body as {
      name?: string;
      description?: string;
    };

    if (!name?.trim()) {
      throw new AppError("Category name is required", 400);
    }

    const normalizedName = name.trim();

    const slug = createSlug(normalizedName);

    if (!slug) {
      throw new AppError("Invalid category name for slug generation", 400);
    }

    const existingCategory = await Category.findOne({
      $or: [{ name: normalizedName }, { slug }],
    });

    if (existingCategory) {
      throw new AppError("Category already exists", 409);
    }

    const categoryData = {
      name: normalizedName,
      slug,
      createdBy: admin._id,
      ...(description?.trim() ? { description: description.trim() } : {}),
    };

    const category = await Category.create(categoryData);

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  },
);

export const getCategories = asyncHandler(
  async (_req: Request, res: Response) => {
    const categories = await Category.find()
      .select("_id name slug description")
      .sort({ name: 1 })
      .lean();

    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");

    return res.status(200).json({
      success: true,
      categories,
    });
  },
);
