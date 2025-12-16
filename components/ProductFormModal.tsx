'use client'

import { useEffect } from 'react'
import ProductForm from './ProductForm'
import type { Article } from '@/types/database'

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  initialProduct?: Article
}

export default function ProductFormModal({
  isOpen,
  onClose,
  mode,
  initialProduct,
}: ProductFormModalProps) {
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white border-2 border-black w-full max-w-6xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-black px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg tracking-tight">
            {mode === 'create' ? 'CREATE PRODUCT' : 'EDIT PRODUCT'}
          </h2>
          <button
            onClick={onClose}
            className="text-xl hover:opacity-50 transition-opacity leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <ProductForm mode={mode} initialProduct={initialProduct} onSuccess={onClose} />
        </div>
      </div>
    </div>
  )
}
