import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import ImageGallery from "@/components/ImageGallery";
import { notFound } from "next/navigation";
import { optimizeCloudinaryImage } from "@/utils/cloudinary";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch single product
  const { data: product } = await supabase
    .from("article")
    .select(
      `
      *,
      category:categories!fk_article_category(id, name, slug),
      tag:tags!fk_article_tag(id, name, slug),
      size:sizes!fk_article_size(id, name, slug)
    `
    )
    .eq("id", id)
    .single();

  if (!product) {
    notFound();
  }

  // Fetch all images for this product
  const { data: images } = await supabase
    .from("product_images")
    .select("*")
    .eq("article_id", id)
    .order("display_order");

  const productImages =
    images && images.length > 0
      ? images.map((img) =>
        optimizeCloudinaryImage(img.image_url, {
          width: 1200,
          quality: "auto",
          crop: "fit",
        })
      )
      : product.img_url
        ? [
          optimizeCloudinaryImage(product.img_url, {
            width: 1200,
            quality: "auto",
            crop: "fit",
          }),
        ]
        : [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-black">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/" className="text-2xl tracking-tight hover:opacity-50">
            JOJO VINTAGE
          </Link>
        </div>
      </header>

      {/* Product Detail */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            {productImages.length === 0 && (
              <div className="aspect-[3/4] border border-black bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>

          <ImageGallery
            images={productImages}
            alt={product.title || "Product"}
          />
          {/* Product Info */}
          <div>
            <h1 className="text-3xl mb-4">{product.title}</h1>

            <div className="text-2xl mb-6">{product.price} kr</div>

            {product.description && (
              <div className="mb-6">
                <p className="text-sm opacity-60 whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            <div className="space-y-3 text-sm mb-8">
              {product.category && (
                <div className="flex gap-2">
                  <span className="opacity-60">Category:</span>
                  <span>{product.category.name}</span>
                </div>
              )}
              {product.size && (
                <div className="flex gap-2">
                  <span className="opacity-60">Size:</span>
                  <span>{product.size.name}</span>
                </div>
              )}
              {product.tag && (
                <div className="flex gap-2">
                  <span className="opacity-60">Tag:</span>
                  <span>{product.tag.name}</span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="opacity-60">Status:</span>
                <span>{product.in_stock ? "In Stock" : "Sold Out"}</span>
              </div>
              <div className="flex gap-2">
                <span className="opacity-60">Type:</span>
                <span>{product.for_sale ? "For Sale" : "For Rent"}</span>
              </div>
            </div>

            {/* Measurements */}
            {product.measurements &&
              Object.keys(product.measurements).length > 0 && (
                <div className="border-t border-black pt-6 mb-8">
                  <h3 className="text-sm font-medium mb-3">
                    MEASUREMENTS (CM)
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {Object.entries(product.measurements).map(
                      ([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="opacity-60 capitalize">{key}:</span>
                          <span>{String(value)}</span>                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            <Link
              href="/"
              className="inline-block px-6 py-3 border border-black hover:bg-black hover:text-white transition-colors"
            >
              ← Back to Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
