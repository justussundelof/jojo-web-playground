// Re-export from database types for backward compatibility
export type { Article as Product, Category, Tag, Size } from './database'

export interface CreateProductRequest {
  title?: string | null
  designer?: string | null
  description?: string | null
  price?: number | null
  width?: string | null
  height?: string | null
  in_stock?: boolean
  for_sale?: boolean
  img_url?: string | null
  category_id?: number | null
  tag_id?: number | null
  size_id?: number | null
}
