'use client'

import { useState } from 'react'

interface ImageGalleryProps {
  images: string[]
  alt?: string
}

export default function ImageGallery({ images, alt = 'Product image' }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
        <span className="text-sm opacity-40">No image</span>
      </div>
    )
  }

  const currentImage = images[selectedIndex]

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative group">
        <img
          src={currentImage}
          alt={`${alt} ${selectedIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-black text-white text-xs">
            {selectedIndex + 1} / {images.length}
          </div>
        )}

        {/* Navigation arrows for mobile/touch */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              onClick={() => setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`aspect-square border-2 overflow-hidden transition-all ${
                index === selectedIndex
                  ? 'border-black'
                  : 'border-gray-300 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
