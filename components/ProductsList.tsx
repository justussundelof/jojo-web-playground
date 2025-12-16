'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { Product } from '@/types/product'
import type { Article } from '@/types/database'
import ProductFormModal from './ProductFormModal'
import ProductOptionsModal from './ProductOptionsModal'
import ConfirmModal from './ConfirmModal'

interface ProductsListProps {
  initialProducts: Product[]
}

export default function ProductsList({ initialProducts }: ProductsListProps) {
  const router = useRouter()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showOptionsModal, setShowOptionsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setShowOptionsModal(true)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setShowEditModal(true)
  }

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedProduct) return

    setIsDeleting(true)

    try {
      const supabase = createClient()

      // Delete the product from database
      const { error } = await supabase
        .from('article')
        .delete()
        .eq('id', selectedProduct.id)

      if (error) {
        throw error
      }

      // Close modal and refresh
      setShowDeleteModal(false)
      setSelectedProduct(null)
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete product. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleModalSuccess = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setSelectedProduct(null)
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl tracking-tight">PRODUCTS</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
        >
          + CREATE PRODUCT
        </button>
      </div>

      {!initialProducts || initialProducts.length === 0 ? (
        <div className="text-center py-12 opacity-60">
          <p>No products yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-block mt-4 border-b border-black hover:opacity-50"
          >
            Add your first product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {initialProducts.map((product: Product) => (
            <button
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="group text-left"
            >
              {product.img_url ? (
                <div className="aspect-[3/4] bg-gray-100 mb-3 overflow-hidden">
                  <img
                    src={product.img_url}
                    alt={product.title || 'Product image'}
                    className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                  />
                </div>
              ) : (
                <div className="aspect-[3/4] bg-gray-100 mb-3 flex items-center justify-center">
                  <span className="text-sm opacity-40">No image</span>
                </div>
              )}
              <div className="text-sm space-y-1">
                <div className="font-medium">{product.title}</div>
                <div className="opacity-60">{product.price} kr</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.category && (
                    <span className="text-xs border border-black px-2 py-0.5">
                      {product.category.name}
                    </span>
                  )}
                  {product.size && (
                    <span className="text-xs border border-black px-2 py-0.5">
                      {product.size.name}
                    </span>
                  )}
                  {product.tag && (
                    <span className="text-xs border border-black px-2 py-0.5 opacity-60">
                      {product.tag.name}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Create Product Modal */}
      <ProductFormModal
        isOpen={showCreateModal}
        onClose={handleModalSuccess}
        mode="create"
      />

      {/* Edit Product Modal */}
      <ProductFormModal
        isOpen={showEditModal}
        onClose={handleModalSuccess}
        mode="edit"
        initialProduct={selectedProduct as Article}
      />

      {/* Product Options Modal */}
      <ProductOptionsModal
        isOpen={showOptionsModal}
        onClose={() => {
          setShowOptionsModal(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedProduct(null)
        }}
        onConfirm={confirmDelete}
        title="Radera produkt?"
        message={`Är du säker på att du vill radera "${selectedProduct?.title}"? Detta kan inte ångras.`}
        confirmText={isDeleting ? 'Raderar...' : 'Radera'}
        cancelText="Avbryt"
        confirmButtonClass="bg-red-600 text-white hover:bg-red-700 border-red-600"
      />
    </>
  )
}
