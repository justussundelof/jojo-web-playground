import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Product } from '@/types/product'

export default async function ProductsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: products } = await supabase
    .from('article')
    .select('*')
    .order('created_at', { ascending: false })

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
              href="/admin/products/add"
              className="text-sm hover:opacity-50 transition-opacity"
            >
              Add Product
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
        <h1 className="text-2xl mb-8 tracking-tight">PRODUCTS</h1>

        {!products || products.length === 0 ? (
          <div className="text-center py-12 opacity-60">
            <p>No products yet</p>
            <Link
              href="/admin/products/add"
              className="inline-block mt-4 border-b border-black hover:opacity-50"
            >
              Add your first product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product: Product) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}`}
                className="group"
              >
                {product.img_url ? (
                  <div className="aspect-[3/4] bg-gray-100 mb-3 overflow-hidden">
                    <img
                      src={product.img_url}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                    />
                  </div>
                ) : (
                  <div className="aspect-[3/4] bg-gray-100 mb-3 flex items-center justify-center">
                    <span className="text-sm opacity-40">No image</span>
                  </div>
                )}
                <div className="text-sm">
                  <div className="mb-1">{product.title}</div>
                  <div className="opacity-60">${product.price}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
