import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminDashboard() {
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

  const totalProducts = products?.length || 0

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-black">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl tracking-tight">ADMIN</h1>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm hover:opacity-50 transition-opacity"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
          {/* Products Count */}
          <div className="border border-black p-8">
            <div className="text-sm mb-2 opacity-60">TOTAL PRODUCTS</div>
            <div className="text-4xl">{totalProducts}</div>
          </div>

          {/* Add Product */}
          <Link
            href="/admin/products/add"
            className="border border-black p-8 hover:bg-black hover:text-white transition-colors group"
          >
            <div className="text-sm mb-2 opacity-60 group-hover:opacity-100">
              ADD NEW
            </div>
            <div className="text-4xl">+</div>
          </Link>

          {/* View Products */}
          <Link
            href="/admin/products"
            className="border border-black p-8 hover:bg-black hover:text-white transition-colors"
          >
            <div className="text-sm mb-2">VIEW ALL PRODUCTS</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
