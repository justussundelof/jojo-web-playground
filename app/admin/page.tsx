import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminProductGrid from "@/components/AdminProductGrid";

export default async function AdminDashboard() {
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
      {/* Header */}

      {/* Main Content */}
      <div className="pt-[10vh] lg:pt-[20vh] pl-0 lg:pl-14 w-full flex-col bg-background">
        <div className="flex flex-col pl:0 lg:flex-row lg:pl-3">
          <span className="flex flex-col px-3 py-9  gap-x-3 space-y-1.5 mb-12 ">
            <h1 className="text-xl font-serif-display  ">
              Welcome dear
              <strong className="ml-1.5 font-normal ">JOJO Studio Admin</strong>
              !
            </h1>
            <p className="font-serif-book max-w-sm">
              This is the admin page where the magic happens. Here you can add
              products, edit content and more. <br /> Have fun!
            </p>
          </span>
        </div>

        {!products || products.length === 0 ? null : (
          <AdminProductGrid products={products} />
        )}
      </div>
    </div>
  );
}
