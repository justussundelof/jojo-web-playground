export interface Product {
  id?: number
  created_at?: string
  title?: string
  designer?: string
  size?: string
  width?: string
  height?: string
  description?: string
  category?: string
  tag?: string
  price?: number
  in_stock?: boolean
  for_sale?: boolean
  img_url?: string
}

export interface CreateProductRequest {
  title?: string
  designer?: string
  size?: string
  width?: string
  height?: string
  description?: string
  category?: string
  tag?: string
  price?: number
  in_stock?: boolean
  for_sale?: boolean
  img_url?: string
}
