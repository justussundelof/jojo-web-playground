import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { optimizeCloudinaryImage } from '@/utils/cloudinary'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch products with their related data
  const { data: products } = await supabase
    .from('article')
    .select(`
      *,
      category:categories!fk_article_category(id, name, slug),
      tag:tags!fk_article_tag(id, name, slug),
      size:sizes!fk_article_size(id, name, slug)
    `)
    .eq('in_stock', true) // Only show products in stock
    .order('created_at', { ascending: false })

  // For each product, get the primary image
  const productsWithImages = await Promise.all(
    (products || []).map(async (product) => {
      const { data: images } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('article_id', product.id)
        .eq('is_primary', true)
        .single()

      const primaryImage = images?.image_url || product.img_url

      return {
        ...product,
        primaryImage: primaryImage
          ? optimizeCloudinaryImage(primaryImage, {
              width: 600,
              height: 800,
              quality: 'auto',
              crop: 'fill',
              gravity: 'auto',
            })
          : null,
      }
    })
  )

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-black">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl tracking-tight">JOJO VINTAGE</h1>
        </div>
      </header>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {productsWithImages.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group"
            >
              {product.primaryImage ? (
                <div className="aspect-[3/4] bg-gray-100 mb-3 overflow-hidden">
                  <img
                    src={product.primaryImage}
                    alt={product.title || 'Product'}
                    className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                  />
                </div>
              ) : (
                <div className="aspect-[3/4] bg-gray-100 mb-3 flex items-center justify-center">
                  <span className="text-sm opacity-40">No image</span>
                </div>
              )}
              <div className="text-sm space-y-1">
                <div className="font-medium">{product.title}</div>
                <div className="opacity-60">{product.price} kr</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.category && (
                    <span className="text-xs border border-black px-2 py-0.5">
                      {product.category.name}
                    </span>
                  )}
                  {product.size && (
                    <span className="text-xs border border-black px-2 py-0.5">
                      {product.size.name}
                    </span>
                  )}
                  {product.tag && (
                    <span className="text-xs border border-black px-2 py-0.5 opacity-60">
                      {product.tag.name}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {productsWithImages.length === 0 && (
          <div className="text-center py-12 opacity-60">
            <p>No products available</p>
          </div>
        )}
      </div>
    </div>
  )
}