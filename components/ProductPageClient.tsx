'use client'

import { useProducts } from '@/context/ProductContext'
import ProductGrid from './ProductGrid'

export default function ProductPageClient() {
  const { products, loading, error } = useProducts()

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm opacity-60 tracking-wide">LOADING PRODUCTS...</div>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm opacity-60 tracking-wide mb-2">ERROR</div>
          <div className="text-xs opacity-40">{error}</div>
        </div>
      </div>
    )
  }

  // Empty State
  if (products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm opacity-60 tracking-wide">NO PRODUCTS AVAILABLE</div>
        </div>
      </div>
    )
  }

  // Success State - Display Products
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-black">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl tracking-tight">JOJO VINTAGE</h1>
        </div>
      </header>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <ProductGrid products={products} />
      </div>
    </main>
  )
}
