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
    designer: '',
    description: '',
    price: '',
    category: '',
    tag: '',
    size: '',
    width: '',
    height: '',
    in_stock: true,
    for_sale: true,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    const supabase = createClient()
    const fileName = `product-${Date.now()}.jpg`
    const filePath = `shop/products/${fileName}`

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

      // Create product - prepare data
      const insertData: any = {
        title: formData.title || null,
        designer: formData.designer || null,
        description: formData.description || null,
        price: formData.price ? parseFloat(formData.price) : null,
        width: formData.width || null,
        height: formData.height || null,
        in_stock: formData.in_stock,
        for_sale: formData.for_sale,
        img_url: imageUrl,
      }

      // Only include enum fields if they have values
      if (formData.category) insertData.category = formData.category
      if (formData.tag) insertData.tag = formData.tag
      if (formData.size) insertData.size = formData.size

      const { error: insertError } = await supabase.from('article').insert([insertData])

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
                <label className="block text-sm mb-2 opacity-60">TITLE</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-black focus:outline-none"
                  placeholder="Vintage Leather Jacket"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-60">DESIGNER</label>
                <input
                  type="text"
                  name="designer"
                  value={formData.designer}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-black focus:outline-none"
                  placeholder="Yohji Yamamoto"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-60">DESCRIPTION</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-black focus:outline-none resize-none"
                  placeholder="About the article..."
                />
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-60">PRICE</label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-black focus:outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-60">CATEGORY</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-black focus:outline-none bg-white"
                >
                  <option value="">Select category</option>
                  <option value="accessories">accessories</option>
                  <option value="bags">bags</option>
                  <option value="clothing">clothing</option>
                  <option value="shoes">shoes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-60">TAG</label>
                <select
                  name="tag"
                  value={formData.tag}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-black focus:outline-none bg-white"
                >
                  <option value="">Select tag</option>
                  <option value="y2k">y2k</option>
                  <option value="christmas">christmas</option>
                  <option value="summer">summer</option>
                  <option value="grunge">grunge</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-60">SIZE</label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-black focus:outline-none bg-white"
                >
                  <option value="">Select size</option>
                  <option value="s">S</option>
                  <option value="m">M</option>
                  <option value="l">L</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 opacity-60">WIDTH (cm)</label>
                  <input
                    type="text"
                    name="width"
                    value={formData.width}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-black focus:outline-none"
                    placeholder="50"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 opacity-60">HEIGHT (cm)</label>
                  <input
                    type="text"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-black focus:outline-none"
                    placeholder="70"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="in_stock"
                    checked={formData.in_stock}
                    onChange={handleChange}
                    className="w-4 h-4 border border-black"
                  />
                  <span className="text-sm">IN STOCK</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="for_sale"
                    checked={formData.for_sale}
                    onChange={handleChange}
                    className="w-4 h-4 border border-black"
                  />
                  <span className="text-sm">FOR SALE</span>
                </label>
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
