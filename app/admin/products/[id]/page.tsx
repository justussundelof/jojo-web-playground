import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Product } from '@/types/product'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch product with joined data
  const { data: product, error } = await supabase
    .from('article')
    .select(`
      *,
      category:categories!fk_article_category(id, name, slug, parent_id),
      tag:tags!fk_article_tag(id, name, slug),
      size:sizes!fk_article_size(id, name, slug)
    `)
    .eq('id', id)
    .single()

  if (error || !product) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-black">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin" className="text-xl tracking-tight hover:opacity-50">
            ADMIN
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/admin/products"
              className="text-sm hover:opacity-50 transition-opacity"
            >
              All Products
            </Link>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm hover:opacity-50 transition-opacity"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Link
          href="/admin/products"
          className="inline-block mb-8 text-sm opacity-60 hover:opacity-100"
        >
          ← Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div>
            {product.img_url ? (
              <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                <img
                  src={product.img_url}
                  alt={product.title || 'Product image'}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                <span className="text-sm opacity-40">No image</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl mb-2 tracking-tight">
                {product.title || 'Untitled'}
              </h1>
              {product.designer && (
                <p className="text-xl opacity-60">{product.designer}</p>
              )}
            </div>

            {product.price && (
              <div className="text-2xl">${product.price}</div>
            )}

            {product.description && (
              <div className="border-t border-black pt-6">
                <h2 className="text-sm mb-2 opacity-60">DESCRIPTION</h2>
                <p className="whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            <div className="border-t border-black pt-6 space-y-4">
              <h2 className="text-sm mb-4 opacity-60">DETAILS</h2>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.category && (
                  <div>
                    <span className="opacity-60">Category:</span>
                    <div className="mt-1">{product.category.name}</div>
                  </div>
                )}

                {product.size && (
                  <div>
                    <span className="opacity-60">Size:</span>
                    <div className="mt-1">{product.size.name}</div>
                  </div>
                )}

                {product.tag && (
                  <div>
                    <span className="opacity-60">Tag:</span>
                    <div className="mt-1">{product.tag.name}</div>
                  </div>
                )}

                {(product.width || product.height) && (
                  <div>
                    <span className="opacity-60">Dimensions:</span>
                    <div className="mt-1">
                      {product.width && `W: ${product.width}cm`}
                      {product.width && product.height && ' × '}
                      {product.height && `H: ${product.height}cm`}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <span className="opacity-60 text-sm">In Stock:</span>
                  <span className="text-sm">
                    {product.in_stock ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="opacity-60 text-sm">For Sale:</span>
                  <span className="text-sm">
                    {product.for_sale ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
              </div>
            </div>

            {product.created_at && (
              <div className="border-t border-black pt-6 text-sm opacity-60">
                Created: {new Date(product.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="border-t border-black pt-6 flex gap-4">
              <button className="px-6 py-3 border border-black hover:bg-black hover:text-white transition-colors">
                Edit Product
              </button>
              <button className="px-6 py-3 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors">
                Delete Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
