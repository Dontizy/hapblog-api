

export type blogCreateType = {
  title: string;
  category?:string | undefined;
  content: string;
  status?: "draft" | "published";
};

export type updateBlogType = {
  title?: string;
  content?: string;
  status?: "draft" | "published";
  category?: string | undefined;
};
