export interface Article {
  id?: string
  title: string
  description: string
  price: number
  category: string
  size: string
  color: string
  material?: string
  brand?: string
  stock_quantity: number
  image_url?: string
  is_featured?: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateArticleRequest {
  title: string
  description: string
  price: number
  category: string
  size: string
  color: string
  material?: string
  brand?: string
  stock_quantity: number
  image_url?: string
  is_featured?: boolean
}
