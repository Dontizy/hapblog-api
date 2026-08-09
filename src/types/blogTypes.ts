import type { BlogCategory } from "./blogCategory.js";

export type blogCreateType = {
  title: string;
  category: BlogCategory;
  content: string;
  status?: "draft" | "published";
};

export type updateBlogType = {
  title?: string;
  content?: string;
  status?: "draft" | "published";
  category?: BlogCategory;
};
