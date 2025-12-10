'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProductForm from '@/components/ProductForm'
import type { Article } from '@/types/database'

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [productId, setProductId] = useState<string | null>(null)
  const [product, setProduct] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params
      setProductId(resolvedParams.id)
    }
    init()
  }, [params])

  useEffect(() => {
    if (!productId) return

    const fetchProduct = async () => {
      const supabase = createClient()

      // Check authentication
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      // Fetch product
      const { data, error: fetchError } = await supabase
        .from('article')
        .select(`
          *,
          category:categories!fk_article_category(id, name, slug, parent_id),
          tag:tags!fk_article_tag(id, name, slug),
          size:sizes!fk_article_size(id, name, slug)
        `)
        .eq('id', productId)
        .single()

      if (fetchError || !data) {
        setError('Product not found')
        setLoading(false)
        return
      }

      setProduct(data)
      setLoading(false)
    }

    fetchProduct()
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen">
        <header className="border-b border-black">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/admin" className="text-xl tracking-tight hover:opacity-50">
              ADMIN
            </Link>
            <Link
              href="/admin/products"
              className="text-sm hover:opacity-50 transition-opacity"
            >
              Back to Products
            </Link>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="border border-red-600 px-4 py-3 text-red-600">
            {error || 'Product not found'}
          </div>
          <Link
            href="/admin/products"
            className="inline-block mt-4 text-sm border-b border-black hover:opacity-50"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    )
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
              href={`/admin/products/${productId}`}
              className="text-sm hover:opacity-50 transition-opacity"
            >
              Cancel
            </Link>
            <Link
              href="/admin/products"
              className="text-sm hover:opacity-50 transition-opacity"
            >
              All Products
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl mb-8 tracking-tight">EDIT PRODUCT</h1>
        <ProductForm mode="edit" initialProduct={product} />
      </div>
    </div>
  )
}
