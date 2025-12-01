import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import type { Article } from '@/types/article'

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })

  const totalArticles = articles?.length || 0
  const inStock = articles?.filter((a: Article) => a.stock_quantity > 0).length || 0
  const outOfStock = articles?.filter((a: Article) => a.stock_quantity === 0).length || 0
  const featured = articles?.filter((a: Article) => a.is_featured).length || 0
  const totalValue = articles?.reduce((sum: number, a: Article) => sum + (a.price * a.stock_quantity), 0) || 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome to your boutique admin panel
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <Link
          href="/admin/articles/create"
          className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow-sm hover:shadow-md transition"
        >
          <div>
            <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">
              <span className="absolute inset-0" aria-hidden="true" />
              Add New Article
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Create a new article listing for your boutique
            </p>
          </div>
          <span
            className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
            aria-hidden="true"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
            </svg>
          </span>
        </Link>

        <Link
          href="/admin/articles"
          className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow-sm hover:shadow-md transition"
        >
          <div>
            <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">
              <span className="absolute inset-0" aria-hidden="true" />
              View All Articles
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Browse and manage your article inventory
            </p>
          </div>
          <span
            className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
            aria-hidden="true"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
            </svg>
          </span>
        </Link>

        <Link
          href="/"
          className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow-sm hover:shadow-md transition"
        >
          <div>
            <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">
              <span className="absolute inset-0" aria-hidden="true" />
              View Store
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              See how your boutique appears to customers
            </p>
          </div>
          <span
            className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
            aria-hidden="true"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
            </svg>
          </span>
        </Link>
      </div>

      {/* Statistics */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Articles
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {totalArticles}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-8 w-8 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      In Stock
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {inStock}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-8 w-8 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Out of Stock
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {outOfStock}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-8 w-8 text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Featured
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {featured}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Value */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-100">Total Inventory Value</p>
            <p className="text-3xl font-bold mt-2">${totalValue.toFixed(2)}</p>
          </div>
          <div>
            <svg
              className="h-16 w-16 text-blue-200 opacity-50"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Recent Articles */}
      {articles && articles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Articles</h2>
            <Link
              href="/admin/articles"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {articles.slice(0, 5).map((article: Article) => (
                <li key={article.id}>
                  <Link
                    href={`/admin/articles/${article.id}`}
                    className="block hover:bg-gray-50 transition"
                  >
                    <div className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center min-w-0 flex-1">
                        {article.image_url && (
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="h-12 w-12 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className={`min-w-0 flex-1 ${article.image_url ? 'ml-4' : ''}`}>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {article.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {article.category} • ${article.price.toFixed(2)} • Stock: {article.stock_quantity}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                        {article.is_featured && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
