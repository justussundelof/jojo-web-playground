'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import PhotoCapture from '@/components/PhotoCapture'
import Link from 'next/link'
import type { Category, Tag, Size } from '@/types/database'

export default function AddProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  // Fetched data from database
  const [genders, setGenders] = useState<Category[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [sizes, setSizes] = useState<Size[]>([])
  const [selectedGender, setSelectedGender] = useState<string>('')

  const [formData, setFormData] = useState({
    title: '',
    designer: '',
    description: '',
    price: '',
    category_id: '',
    tag_id: '',
    size_id: '',
    width: '',
    height: '',
    in_stock: true,
    for_sale: true,
  })

  // Fetch categories, tags, and sizes on mount
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      // Fetch top-level categories (genders)
      const { data: genderData } = await supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
        .order('name')

      if (genderData) setGenders(genderData)

      // Fetch tags
      const { data: tagData } = await supabase
        .from('tags')
        .select('*')
        .order('name')

      if (tagData) setTags(tagData)

      // Fetch sizes
      const { data: sizeData } = await supabase
        .from('sizes')
        .select('*')
        .order('sort_order')

      if (sizeData) setSizes(sizeData)
    }

    fetchData()
  }, [])

  // Fetch subcategories when gender changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedGender) {
        setCategories([])
        return
      }

      const supabase = createClient()
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', selectedGender)
        .order('name')

      if (data) setCategories(data)
    }

    fetchSubcategories()
  }, [selectedGender])

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

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGender(e.target.value)
    // Reset category when gender changes
    setFormData((prev) => ({
      ...prev,
      category_id: '',
    }))
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Get signature from our API
      const signResponse = await fetch('/api/cloudinary/sign', {
        method: 'POST',
      })

      if (!signResponse.ok) {
        throw new Error('Failed to get upload signature')
      }

      const { signature, timestamp, cloudName, apiKey, folder } = await signResponse.json()

      // Prepare form data for Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('signature', signature)
      formData.append('timestamp', timestamp.toString())
      formData.append('api_key', apiKey)
      formData.append('folder', folder)

      // Upload to Cloudinary
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!uploadResponse.ok) {
        throw new Error('Upload to Cloudinary failed')
      }

      const data = await uploadResponse.json()

      // Return the secure URL
      return data.secure_url
    } catch (error) {
      console.error('Upload error:', error)
      return null
    }
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

      // Only include foreign key fields if they have values
      if (formData.category_id) insertData.category_id = parseInt(formData.category_id)
      if (formData.tag_id) insertData.tag_id = parseInt(formData.tag_id)
      if (formData.size_id) insertData.size_id = parseInt(formData.size_id)

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
                <label className="block text-sm mb-2 opacity-60">GENDER</label>
                <select
                  value={selectedGender}
                  onChange={handleGenderChange}
                  className="w-full px-4 py-3 border border-black focus:outline-none bg-white"
                >
                  <option value="">Select gender</option>
                  {genders.map((gender) => (
                    <option key={gender.id} value={gender.id}>
                      {gender.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-60">CATEGORY</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  disabled={!selectedGender}
                  className="w-full px-4 py-3 border border-black focus:outline-none bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-60">TAG</label>
                <select
                  name="tag_id"
                  value={formData.tag_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-black focus:outline-none bg-white"
                >
                  <option value="">Select tag</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-60">SIZE</label>
                <select
                  name="size_id"
                  value={formData.size_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-black focus:outline-none bg-white"
                >
                  <option value="">Select size</option>
                  {sizes.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.name}
                    </option>
                  ))}
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
