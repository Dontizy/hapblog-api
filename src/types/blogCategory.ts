export const BLOG_CATEGORIES = [
  // Tech
  "Technology",
  "Programming",
  "Web Development",
  "Mobile Development",
  "AI",
  "Cybersecurity",
  "Data Science",

  // Business
  "Business",
  "Finance",

  // Lifestyle
  "Lifestyle",
  "Health",
  "Fitness",
  "Travel",
  "Food",
  "Fashion",

  // Education
  "Education",
  "Science",

  // Entertainment
  "Entertainment",
  "Movies",
  "Music",
  "Gaming",
  "Sports",

  // Society
  "News",
  "Politics",
  "Opinion",

  // Misc
  "Design",
  "Other",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
