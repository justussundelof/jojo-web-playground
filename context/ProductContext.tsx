'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Article } from '@/types/database'

interface ProductContextType {
  products: Article[]
  loading: boolean
  error: string | null
  refreshProducts: () => Promise<void>
  filterProducts: (filters: ProductFilters) => Article[]
}

interface ProductFilters {
  category?: string
  tag?: string
  size?: string
  inStock?: boolean
  forSale?: boolean
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('article')
        .select(`
          *,
          category:categories!fk_article_category(id, name, slug),
          size:sizes!fk_article_size(id, name, slug),
          tag:tags!fk_article_tag(id, name, slug)
        `)
        .eq('in_stock', true) // Only show in-stock items
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // For each product, get the primary image from product_images table
      const productsWithImages = await Promise.all(
        (data || []).map(async (product) => {
          const { data: images } = await supabase
            .from('product_images')
            .select('image_url')
            .eq('article_id', product.id)
            .eq('is_primary', true)
            .single()

          // Use primary image from product_images, fallback to img_url
          return {
            ...product,
            img_url: images?.image_url || product.img_url,
          }
        })
      )

      setProducts(productsWithImages)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const refreshProducts = async () => {
    await fetchProducts()
  }

  const filterProducts = (filters: ProductFilters): Article[] => {
    return products.filter((product) => {
      if (filters.category && product.category?.slug !== filters.category) {
        return false
      }
      if (filters.tag && product.tag?.slug !== filters.tag) {
        return false
      }
      if (filters.size && product.size?.slug !== filters.size) {
        return false
      }
      if (filters.inStock !== undefined && product.in_stock !== filters.inStock) {
        return false
      }
      if (filters.forSale !== undefined && product.for_sale !== filters.forSale) {
        return false
      }
      return true
    })
  }

  const value = {
    products,
    loading,
    error,
    refreshProducts,
    filterProducts,
  }

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

// Custom hook for using product context
export function useProducts() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider')
  }
  return context
}
