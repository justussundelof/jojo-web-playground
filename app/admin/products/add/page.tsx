'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import PhotoCapture from '@/components/PhotoCapture'
import Link from 'next/link'

export default function AddProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    size: '',
    color: '',
    brand: '',
    condition: '',
    era: '',
    stock_quantity: '1',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    const supabase = createClient()
    const fileName = `product-${Date.now()}.jpg`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('jojo-media')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return null
    }

    const { data } = supabase.storage
      .from('jojo-media')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Upload image first if exists
      let imageUrl = null
      if (photoFile) {
        imageUrl = await uploadImage(photoFile)
        if (!imageUrl) {
          throw new Error('Failed to upload image')
        }
      }

      // Create product
      const { error: insertError } = await supabase.from('products').insert([
        {
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          size: formData.size,
          color: formData.color,
          brand: formData.brand || null,
          condition: formData.condition || null,
          era: formData.era || null,
          stock_quantity: parseInt(formData.stock_quantity),
          image_url: imageUrl,
        },
      ])

      if (insertError) {
        throw insertError
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
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

        {error && (
          <div className="mb-6 border border-red-600 px-4 py-3 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Photo Section */}
            <div>
              <PhotoCapture
                onPhotoCapture={(file) => setPhotoFile(file)}
                currentImage={photoFile ? URL.createObjectURL(photoFile) : undefined}
              />
            </div>

            {/* Form Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm mb-2 opacity-60">TITLE *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-black focus:outline-none"
                  placeholder="Vintage Levi's Jacket"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-60">DESCRIPTION *</label>
                <textarea
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-black focus:outline-none resize-none"
                  placeholder="Describe the product..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 opacity-60">PRICE *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-black focus:outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 opacity-60">STOCK *</label>
                  <input
                    type="number"
                    name="stock_quantity"
                    required
                    min="0"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-60">CATEGORY *</label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-black focus:outline-none bg-white"
                >
                  <option value="">Select category</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Tops">Tops</option>
                  <option value="Bottoms">Bottoms</option>
                  <option value="Dresses">Dresses</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Shoes">Shoes</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 opacity-60">SIZE *</label>
                  <select
                    name="size"
                    required
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-black focus:outline-none bg-white"
                  >
                    <option value="">Select size</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                    <option value="One Size">One Size</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 opacity-60">COLOR *</label>
                  <input
                    type="text"
                    name="color"
                    required
                    value={formData.color}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-black focus:outline-none"
                    placeholder="Black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-60">BRAND</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-black focus:outline-none"
                  placeholder="Levi's"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 opacity-60">CONDITION</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-black focus:outline-none bg-white"
                  >
                    <option value="">Select condition</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 opacity-60">ERA</label>
                  <input
                    type="text"
                    name="era"
                    value={formData.era}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-black focus:outline-none"
                    placeholder="90s"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors disabled:bg-gray-400 mt-8"
              >
                {loading ? 'CREATING...' : 'CREATE PRODUCT'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
