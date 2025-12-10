import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Product } from '@/types/product'
import ProductActions from '@/components/ProductActions'
import ImageGallery from '@/components/ImageGallery'

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

  // Fetch product images
  const { data: imagesData } = await supabase
    .from('product_images')
    .select('image_url')
    .eq('article_id', id)
    .order('display_order')

  // Use product_images if available, otherwise fallback to img_url
  const productImages = imagesData && imagesData.length > 0
    ? imagesData.map((img) => img.image_url)
    : product.img_url
    ? [product.img_url]
    : []

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
          {/* Image Gallery */}
          <div>
            <ImageGallery images={productImages} alt={product.title || 'Product'} />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl mb-2 tracking-tight">
                {product.title || 'Untitled'}
              </h1>
            </div>

            {product.price && (
              <div className="text-2xl">{product.price} kr</div>
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
              </div>

              <div className="flex gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <span className="opacity-60 text-sm">In Stock:</span>
                  <span className="text-sm">
                    {product.in_stock ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="opacity-60 text-sm">Listing Type:</span>
                  <span className="text-sm">
                    {product.for_sale ? 'Till salu (For Sale)' : 'Uthyrning (For Rent)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Measurements Section */}
            {product.measurements && Object.keys(product.measurements).length > 0 && (
              <div className="border-t border-black pt-6">
                <h2 className="text-sm mb-4 opacity-60">MEASUREMENTS (cm)</h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {(product.measurements as any).shoulder_width && (
                    <div>
                      <span className="opacity-60">Axel till axel:</span>
                      <div className="mt-1">{(product.measurements as any).shoulder_width} cm</div>
                    </div>
                  )}
                  {(product.measurements as any).chest_width && (
                    <div>
                      <span className="opacity-60">Bröstbredd:</span>
                      <div className="mt-1">{(product.measurements as any).chest_width} cm</div>
                    </div>
                  )}
                  {(product.measurements as any).sleeve_length && (
                    <div>
                      <span className="opacity-60">Ärmlängd:</span>
                      <div className="mt-1">{(product.measurements as any).sleeve_length} cm</div>
                    </div>
                  )}
                  {(product.measurements as any).garment_length && (
                    <div>
                      <span className="opacity-60">Plagglängd:</span>
                      <div className="mt-1">{(product.measurements as any).garment_length} cm</div>
                    </div>
                  )}
                  {(product.measurements as any).waist_width && (
                    <div>
                      <span className="opacity-60">Midjebredd:</span>
                      <div className="mt-1">{(product.measurements as any).waist_width} cm</div>
                    </div>
                  )}
                  {(product.measurements as any).hip_width && (
                    <div>
                      <span className="opacity-60">Höftbredd:</span>
                      <div className="mt-1">{(product.measurements as any).hip_width} cm</div>
                    </div>
                  )}
                  {(product.measurements as any).inseam && (
                    <div>
                      <span className="opacity-60">Innerbenslängd:</span>
                      <div className="mt-1">{(product.measurements as any).inseam} cm</div>
                    </div>
                  )}
                  {(product.measurements as any).outseam && (
                    <div>
                      <span className="opacity-60">Ytterbenslängd:</span>
                      <div className="mt-1">{(product.measurements as any).outseam} cm</div>
                    </div>
                  )}
                  {(product.measurements as any).rise && (
                    <div>
                      <span className="opacity-60">Grenhöjd:</span>
                      <div className="mt-1">{(product.measurements as any).rise} cm</div>
                    </div>
                  )}
                  {(product.measurements as any).leg_opening && (
                    <div>
                      <span className="opacity-60">Benslut:</span>
                      <div className="mt-1">{(product.measurements as any).leg_opening} cm</div>
                    </div>
                  )}
                  {(product.measurements as any).slit_length && (
                    <div>
                      <span className="opacity-60">Slits:</span>
                      <div className="mt-1">{(product.measurements as any).slit_length} cm</div>
                    </div>
                  )}
                </div>
              </div>
            )}

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
            <ProductActions productId={product.id!} imageUrl={product.img_url} />
          </div>
        </div>
      </div>
    </div>
  )
}
