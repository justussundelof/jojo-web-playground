'use client'

import { useEffect } from 'react'
import type { Product } from '@/types/product'

interface ProductOptionsModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export default function ProductOptionsModal({
  isOpen,
  onClose,
  product,
  onEdit,
  onDelete,
}: ProductOptionsModalProps) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen || !product) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border-2 border-black max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-black px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg tracking-tight">PRODUCT OPTIONS</h2>
          <button
            onClick={onClose}
            className="text-xl hover:opacity-50 transition-opacity leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Product Preview */}
        <div className="px-6 py-6 border-b border-black">
          <div className="flex gap-6">
            {product.img_url ? (
              <div className="w-32 h-40 bg-gray-100 flex-shrink-0">
                <img
                  src={product.img_url}
                  alt={product.title || 'Product image'}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-40 bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm opacity-40">No image</span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl mb-2">{product.title || 'Untitled'}</h3>
              {product.price && (
                <p className="text-lg opacity-60 mb-2">{product.price} kr</p>
              )}
              {product.description && (
                <p className="text-sm opacity-60 line-clamp-3">
                  {product.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                onEdit(product)
                onClose()
              }}
              className="px-6 py-4 border border-black hover:bg-black hover:text-white transition-colors text-center"
            >
              <div className="text-sm mb-1 opacity-60">EDIT</div>
              <div className="text-lg">✎</div>
            </button>
            <button
              onClick={() => {
                onDelete(product)
                onClose()
              }}
              className="px-6 py-4 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors text-center"
            >
              <div className="text-sm mb-1 opacity-60">DELETE</div>
              <div className="text-lg">🗑</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
