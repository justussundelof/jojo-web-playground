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

// Measurement types for different clothing categories
export interface TopMeasurements {
  shoulder_width?: number  // Axel till axel (cm)
  chest_width?: number      // Bröstbredd / Armhåla till armhåla (cm)
  sleeve_length?: number    // Ärmlängd (cm)
  garment_length?: number   // Plagglängd (cm)
}

export interface PantsMeasurements {
  waist_width?: number      // Midjebredd (cm)
  hip_width?: number        // Höftbredd (cm)
  inseam?: number           // Innerbenslängd (cm)
  outseam?: number          // Ytterbenslängd (cm)
  rise?: number             // Grenhöjd (cm)
  leg_opening?: number      // Benslut (cm)
}

export interface SkirtMeasurements {
  waist_width?: number      // Midjebredd (cm)
  garment_length?: number   // Längd (cm)
}

export interface DressMeasurements {
  shoulder_width?: number   // Axel till axel (cm)
  chest_width?: number      // Armhåla till armhåla (cm)
  waist_width?: number      // Midjebredd (cm)
  hip_width?: number        // Höftbredd (cm)
  garment_length?: number   // Plagglängd (cm)
  sleeve_length?: number    // Ärmlängd (optional) (cm)
  slit_length?: number      // Slits (optional) (cm)
}

export type ProductMeasurements =
  | TopMeasurements
  | PantsMeasurements
  | SkirtMeasurements
  | DressMeasurements

// Product images for multiple image support
export interface ProductImage {
  id: number
  article_id: number
  image_url: string
  display_order: number
  is_primary: boolean
  created_at: string
}

export interface Article {
  id?: number
  created_at?: string
  title?: string | null
  designer?: string | null  // Deprecated - kept for historical data, not used in UI
  description?: string | null
  price?: number | null  // Integer only, in SEK
  width?: string | null
  height?: string | null
  in_stock?: boolean
  for_sale?: boolean  // true = sale, false = rent
  img_url?: string | null  // Deprecated - use images array instead
  measurements?: ProductMeasurements | null  // JSONB column

  // Foreign keys
  category_id?: number | null
  tag_id?: number | null
  size_id?: number | null

  // Joined relations (when using JOIN queries)
  category?: Category
  tag?: Tag
  size?: Size
  images?: ProductImage[]  // Multiple images
}

// Helper type for category tree structure
export interface CategoryTree extends Category {
  children?: CategoryTree[]
}

// Form data for creating/editing articles
export interface ArticleFormData {
  title: string
  description: string
  price: string  // Integer string (will be converted to number)
  width: string
  height: string
  in_stock: boolean
  for_sale: boolean
  category_id: string  // Will be converted to number
  tag_id: string       // Will be converted to number
  size_id: string      // Will be converted to number
  measurements?: ProductMeasurements
}
