// lib/getContent.ts
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function getContent() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [pagesRes, postsRes] = await Promise.all([
    supabase.from("pages").select("*").eq("is_active", true),

    supabase
      .from("posts")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false }),
  ]);

  return {
    pages: pagesRes.data ?? [],
    posts: postsRes.data ?? [],
  };
}
