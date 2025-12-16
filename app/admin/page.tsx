import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/AdminDashboard'

export default async function AdminPage() {
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
        <AdminDashboard totalProducts={totalProducts} />
      </div>
    </div>
  )
}
