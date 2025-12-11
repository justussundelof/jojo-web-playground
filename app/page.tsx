import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch products with their primary images
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

      return {
        ...product,
        primaryImage: images?.image_url || product.img_url,
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productsWithImages.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group"
            >
              <div className="aspect-[3/4] bg-gray-100 border border-black overflow-hidden">
                {product.primaryImage ? (
                  <img
                    src={product.primaryImage}
                    alt={product.title || 'Product'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <div className="mt-3">
                <h3 className="font-medium">{product.title}</h3>
                <p className="text-sm opacity-60 mt-1">
                  {product.price} kr
                </p>
                {product.category && (
                  <p className="text-xs opacity-40 mt-1">
                    {product.category.name}
                  </p>
                )}
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