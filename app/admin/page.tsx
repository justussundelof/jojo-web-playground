import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminProductGrid from "@/components/AdminProductGrid";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch products with joined category, tag, and size data
  const { data: products } = await supabase
    .from("article")
    .select(
      `
      *,
      category:categories!fk_article_category(id, name, slug, parent_id),
      tag:tags!fk_article_tag(id, name, slug),
      size:sizes!fk_article_size(id, name, slug)
    `
    )
    .order("created_at", { ascending: false });

  const totalProducts = products?.length || 0;
  return (
    <div className="min-h-screen  bg-background">
      {/* {/* <div className=" pl-3 pt-24 lg:pl-13 lg:pt-13 text-lg font-serif-display mb-3">
        Admin Dashboard
      </div>

      <AdminDashboard />
      <div className=" pl-3 pt-6 lg:pl-13 lg:pt-13 text-lg font-serif-display mb-3">
        See all Products
      </div> */}
      {!products || products.length === 0 ? null : (
        <AdminProductGrid products={products} />
      )}
    </div>
  );
}
