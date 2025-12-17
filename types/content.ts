export type Page = {
  id: string;
  slug: string;
  title: string | null;
  content: string | null;
  content_html: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

export type Post = {
  id: string;
  type: "blog" | "news";
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  content_html: string | null;
  published_at: string | null;
};
