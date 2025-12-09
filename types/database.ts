// Database types matching the new foreign key structure

export interface Category {
  id: number
  name: string
  slug: string
  parent_id: number | null
  created_at: string
}

export interface Tag {
  id: number
  name: string
  slug: string
  created_at: string
}

export interface Size {
  id: number
  name: string
  slug: string
  sort_order: number
  created_at: string
}

export interface Article {
  id?: number
  created_at?: string
  title?: string | null
  designer?: string | null
  description?: string | null
  price?: number | null
  width?: string | null
  height?: string | null
  in_stock?: boolean
  for_sale?: boolean
  img_url?: string | null

  // Foreign keys
  category_id?: number | null
  tag_id?: number | null
  size_id?: number | null

  // Joined relations (when using JOIN queries)
  category?: Category
  tag?: Tag
  size?: Size
}

// Helper type for category tree structure
export interface CategoryTree extends Category {
  children?: CategoryTree[]
}

// Form data for creating/editing articles
export interface ArticleFormData {
  title: string
  designer: string
  description: string
  price: string
  width: string
  height: string
  in_stock: boolean
  for_sale: boolean
  category_id: string  // Will be converted to number
  tag_id: string       // Will be converted to number
  size_id: string      // Will be converted to number
}
