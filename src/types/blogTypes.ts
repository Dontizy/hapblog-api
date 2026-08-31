

export type blogCreateType = {
  title: string;
  category?:string | undefined;
  content: string;
  status?: "draft" | "published";
  contentImagePublicIds?: string[];
};

export type updateBlogType = {
  title?: string;
  content?: string;
  status?: "draft" | "published";
  category?: string | undefined;
  contentImagePublicIds?: string[];
};
