import { BLOG_CATEGORIES, type BlogCategory } from "../types/blogCategory.js";

export function isBlogCategory(value: unknown): value is BlogCategory {
  return (
    typeof value === "string" && BLOG_CATEGORIES.includes(value as BlogCategory)
  );
}
