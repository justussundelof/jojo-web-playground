'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProductForm from '@/components/ProductForm'

export default function AddProductPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
      } else {
        setIsAuthenticated(true)
      }
    }

    checkAuth()
  }, [])

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
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
          <Link
            href="/admin/products"
            className="text-sm hover:opacity-50 transition-opacity"
          >
            Back to Products
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl mb-8 tracking-tight">ADD PRODUCT</h1>
        <ProductForm mode="create" />
      </div>
    </div>
  )
}
