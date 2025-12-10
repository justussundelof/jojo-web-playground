'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import ConfirmModal from './ConfirmModal'
import Link from 'next/link'

interface ProductActionsProps {
  productId: number
  imageUrl?: string | null
}

export default function ProductActions({ productId, imageUrl }: ProductActionsProps) {
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const supabase = createClient()

      // Delete the product from database
      const { error } = await supabase
        .from('article')
        .delete()
        .eq('id', productId)

      if (error) {
        throw error
      }

      // Note: Cloudinary image deletion would require Admin API
      // For now, we'll leave the image in Cloudinary
      // A cleanup job can be run later to remove orphaned images

      // Redirect to products list
      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete product. Please try again.')
      setIsDeleting(false)
    }
  }

  return (
    <>
      {/* Action Buttons */}
      <div className="border-t border-black pt-6 flex gap-4">
        <Link
          href={`/admin/products/${productId}/edit`}
          className="px-6 py-3 border border-black hover:bg-black hover:text-white transition-colors"
        >
          Edit Product
        </Link>
        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={isDeleting}
          className="px-6 py-3 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? 'Deleting...' : 'Delete Product'}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Radera produkt?"
        message="Är du säker på att du vill radera denna produkt? Detta kan inte ångras."
        confirmText="Radera"
        cancelText="Avbryt"
        confirmButtonClass="bg-red-600 text-white hover:bg-red-700 border-red-600"
      />
    </>
  )
}
