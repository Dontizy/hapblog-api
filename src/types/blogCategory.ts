export const BLOG_CATEGORIES = [
  "Technology",
  "Programming",
  "AI",
  "Business",
  "Design",
  "Lifestyle",
  "Health",
  "Education",
  "Travel",
  "Sports",
  "Entertainment",
  "News",
  "Finance",
  "Food",
  "Politics",
  "Other",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
