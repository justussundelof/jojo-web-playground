import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProductsList from '@/components/ProductsList'

export default async function ProductsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch products with joined category, tag, and size data
  const { data: products } = await supabase
    .from('article')
    .select(`
      *,
      category:categories!fk_article_category(id, name, slug, parent_id),
      tag:tags!fk_article_tag(id, name, slug),
      size:sizes!fk_article_size(id, name, slug)
    `)
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
        <ProductsList initialProducts={products || []} />
      </div>
    </div>
  )
}
