'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProductFormModal from './ProductFormModal'

interface AdminDashboardProps {
  totalProducts: number
}

export default function AdminDashboard({ totalProducts }: AdminDashboardProps) {
  const router = useRouter()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleModalSuccess = () => {
    setShowCreateModal(false)
    router.refresh()
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
        {/* Products Count */}
        <div className="border border-black p-8">
          <div className="text-sm mb-2 opacity-60">TOTAL PRODUCTS</div>
          <div className="text-4xl">{totalProducts}</div>
        </div>

        {/* Add Product */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="border border-black p-8 hover:bg-black hover:text-white transition-colors group text-left"
        >
          <div className="text-sm mb-2 opacity-60 group-hover:opacity-100">
            ADD NEW
          </div>
          <div className="text-4xl">+</div>
        </button>

        {/* View Products */}
        <Link
          href="/admin/products"
          className="border border-black p-8 hover:bg-black hover:text-white transition-colors"
        >
          <div className="text-sm mb-2">VIEW ALL PRODUCTS</div>
        </Link>
      </div>

      {/* Create Product Modal */}
      <ProductFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        mode="create"
      />
    </>
  )
}
