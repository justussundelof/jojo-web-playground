export interface Product {
  id?: string
  title: string
  description: string
  price: number
  category: string
  size: string
  color: string
  brand?: string
  condition?: string
  era?: string
  stock_quantity: number
  image_url?: string
  created_at?: string
  updated_at?: string
}

export interface CreateProductRequest {
  title: string
  description: string
  price: number
  category: string
  size: string
  color: string
  brand?: string
  condition?: string
  era?: string
  stock_quantity: number
  image_url?: string
}
