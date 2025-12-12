'use client'

import Link from 'next/link'
import { optimizeCloudinaryImage } from '@/utils/cloudinary'
import type { Article } from '@/types/database'

interface ProductGridProps {
  products: Article[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {products.map((product) => {
        // Optimize image URL if available
        const imageUrl = product.img_url
          ? optimizeCloudinaryImage(product.img_url, {
              width: 600,
              height: 800,
              quality: 'auto',
              crop: 'fill',
              gravity: 'auto',
            })
          : null

        return (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group cursor-pointer"
          >
            {/* Product Image */}
            {imageUrl ? (
              <div className="aspect-[3/4] bg-gray-100 mb-3 overflow-hidden border border-black">
                <img
                  src={imageUrl}
                  alt={product.title || 'Product image'}
                  className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                />
              </div>
            ) : (
              <div className="aspect-[3/4] bg-gray-100 mb-3 flex items-center justify-center border border-black">
                <span className="text-sm opacity-40">NO IMAGE</span>
              </div>
            )}

            {/* Product Info */}
            <div className="text-sm space-y-1">
              {/* Title */}
              <div className="font-medium tracking-tight">
                {product.title || 'Untitled'}
              </div>

              {/* Price */}
              <div className="opacity-60">{product.price || 0} kr</div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {product.category && (
                  <span className="text-xs border border-black px-2 py-0.5 opacity-60">
                    {product.category.name}
                  </span>
                )}
                {product.size && (
                  <span className="text-xs border border-black px-2 py-0.5 opacity-60">
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
          </Link>
        )
      })}
    </div>
  )
}
