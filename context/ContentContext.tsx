// context/ContentContext.tsx
"use client";

import { createContext, useContext } from "react";
import type { Page, Post } from "@/types/content";

type ContentContextValue = {
  pages: Page[];
  posts: Post[];
  getPageBySlug: (slug: string) => Page | undefined;
  getPostsByType: (type: "blog" | "news") => Post[];
};

const ContentContext = createContext<ContentContextValue | null>(null);

export function ContentProvider({
  pages,
  posts,
  children,
}: {
  pages: Page[];
  posts: Post[];
  children: React.ReactNode;
}) {
  const getPageBySlug = (slug: string) =>
    pages.find((page) => page.slug === slug);

  const getPostsByType = (type: "blog" | "news") =>
    posts.filter((post) => post.type === type);

  return (
    <ContentContext.Provider
      value={{ pages, posts, getPageBySlug, getPostsByType }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}
