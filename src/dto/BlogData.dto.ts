import { Types } from "mongoose";

export interface CreateBlogDTO {
  title: string;
  content: string;
  category: string | null;
  author: Types.ObjectId;
  status: "draft" | "published";
  imageUrl?: string;
  slug: string;
}
