# Product Requirements Document (PRD)
## JOJO Vintage Shop - Public Product Grid & Context Setup

**Version:** 1.0
**Date:** 2025-12-10
**Project:** JOJO Web Playground - Frontend Product Display
**Document Owner:** Product Team
**Priority:** High

---

## 1. Executive Summary

This PRD outlines the implementation of a public-facing product grid on the homepage, including:
1. Display products in a responsive grid on the homepage (`/app/page.tsx`)
2. Create React Context for global product state management
3. Fetch products from Supabase and store in Context
4. Use consistent styling patterns from the existing admin interface

---

## 2. Current State Analysis

### 2.1 Existing Implementation

**Homepage Status:**
- **File:** `/app/page.tsx`
- **Current:** Minimal page that fetches "todos" from Supabase
- **Styling:** None - just a basic `<ul>` list
- **Status:** Needs complete rebuild

**Context Setup:**
- **Status:** ❌ No context files exist in project
- **Current Approach:** Direct Supabase queries in components
- **Need:** Global state management for products

**Navigation/Header Components:**
- **SiteSelector:** ❌ Does not exist
- **HeaderNav:** ❌ Does not exist
- **Note:** Will use existing admin product grid styling as reference

---

### 2.2 Reference Styling (Admin Product Grid)

**File:** `/app/admin/products/page.tsx`

**Existing Pattern:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
  {products.map((product) => (
    <Link key={product.id} href={`/products/${product.id}`} className="group">
      {/* 3:4 aspect ratio image */}
      <div className="aspect-[3/4] bg-gray-100 mb-3 overflow-hidden">
        <img
          src={product.img_url}
          className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
        />
      </div>
      {/* Product info */}
      <div className="text-sm space-y-1">
        <div className="font-medium">{product.title}</div>
        <div className="opacity-60">${product.price}</div>
      </div>
    </Link>
  ))}
</div>
```

**Styling Characteristics:**
- Clean, minimal design
- 3:4 aspect ratio for product images
- Responsive grid: 1 col mobile → 3 cols tablet → 4 cols desktop
- Subtle hover effects (opacity change)
- Black borders for definition
- Small, opacity-based secondary text

---

## 3. Requirements

### 3.1 Product Context Setup

**Priority:** High
**Effort:** Medium

#### 3.1.1 Functional Requirements

**FR-CTX-001:** Create ProductContext for global state management

**User Story:**
> As a developer, I want a centralized state management system so that product data is accessible throughout the application without prop drilling.

**Requirements:**
- Create `ProductContext` with React Context API
- Store fetched products in context state
- Provide loading and error states
- Make context available to all components via Provider
- Support product filtering (for future features)

---

#### 3.1.2 Technical Implementation

**Create Context File:**

**File:** `/context/ProductContext.tsx`

```typescript
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Article } from '@/types/database'

interface ProductContextType {
  products: Article[]
  loading: boolean
  error: string | null
  refreshProducts: () => Promise<void>
  filterProducts: (filters: ProductFilters) => Article[]
}

interface ProductFilters {
  category?: string
  tag?: string
  size?: string
  inStock?: boolean
  forSale?: boolean
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('article')
        .select(`
          *,
          category:categories(id, name, slug),
          size:sizes(id, name, slug),
          tag:tags(id, name, slug)
        `)
        .eq('in_stock', true)  // Only show in-stock items
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setProducts(data || [])
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const refreshProducts = async () => {
    await fetchProducts()
  }

  const filterProducts = (filters: ProductFilters): Article[] => {
    return products.filter((product) => {
      if (filters.category && product.category?.slug !== filters.category) {
        return false
      }
      if (filters.tag && product.tag?.slug !== filters.tag) {
        return false
      }
      if (filters.size && product.size?.slug !== filters.size) {
        return false
      }
      if (filters.inStock !== undefined && product.in_stock !== filters.inStock) {
        return false
      }
      if (filters.forSale !== undefined && product.for_sale !== filters.forSale) {
        return false
      }
      return true
    })
  }

  const value = {
    products,
    loading,
    error,
    refreshProducts,
    filterProducts,
  }

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
}

// Custom hook for using product context
export function useProducts() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider')
  }
  return context
}
```

---

#### 3.1.3 Add Provider to Root Layout

**File:** `/app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProductProvider } from "@/context/ProductContext";  // NEW

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JOJO Vintage Shop",
  description: "Curated vintage fashion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ProductProvider>  {/* NEW */}
          {children}
        </ProductProvider>
      </body>
    </html>
  );
}
```

---

### 3.2 Homepage Product Grid

**Priority:** High
**Effort:** Medium

#### 3.2.1 Functional Requirements

**FR-GRID-001:** Display products in responsive grid on homepage

**User Story:**
> As a visitor, I want to see available products on the homepage so that I can browse the vintage shop inventory.

**Requirements:**
- Show all in-stock products
- Responsive grid layout (1/3/4 columns)
- Product image with 3:4 aspect ratio
- Product title, price
- Link to product detail page (future)
- Loading state while fetching
- Error state if fetch fails
- Empty state if no products

---

#### 3.2.2 Technical Implementation

**Replace Homepage:**

**File:** `/app/page.tsx`

```typescript
'use client'

import { useProducts } from '@/context/ProductContext'
import Link from 'next/link'

export default function HomePage() {
  const { products, loading, error } = useProducts()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm opacity-60 tracking-wide">LOADING PRODUCTS...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm opacity-60 tracking-wide mb-2">ERROR</div>
          <div className="text-xs opacity-40">{error}</div>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm opacity-60 tracking-wide">NO PRODUCTS AVAILABLE</div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8 md:p-12 lg:p-16">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-2xl md:text-3xl font-medium tracking-tight mb-2">
          JOJO VINTAGE
        </h1>
        <p className="text-sm opacity-60">
          Curated vintage fashion
        </p>
      </header>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <div key={product.id} className="group cursor-pointer">
            {/* Product Image */}
            {product.img_url ? (
              <div className="aspect-[3/4] bg-gray-100 mb-3 overflow-hidden border border-black">
                <img
                  src={product.img_url}
                  alt={product.title || 'Product image'}
                  className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                />
              </div>
            ) : (
              <div className="aspect-[3/4] bg-gray-100 mb-3 flex items-center justify-center border border-black">
                <span className="text-sm opacity-40">NO IMAGE</span>
              </div>
            )}

            {/* Product Info */}
            <div className="text-sm space-y-1">
              {/* Title */}
              <div className="font-medium tracking-tight">
                {product.title || 'Untitled'}
              </div>

              {/* Price */}
              <div className="opacity-60">
                ${product.price || '0.00'}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                {product.category && (
                  <span className="text-xs border border-black px-2 py-0.5 opacity-60">
                    {product.category.name}
                  </span>
                )}
                {product.size && (
                  <span className="text-xs border border-black px-2 py-0.5 opacity-60">
                    {product.size.name}
                  </span>
                )}
                {product.tag && (
                  <span className="text-xs border border-black px-2 py-0.5 opacity-60">
                    {product.tag.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
```

---

### 3.3 Styling Consistency

**Priority:** Medium
**Effort:** Low

#### 3.3.1 Design System Reference

**Typography:**
```css
/* Headings */
.heading-large {
  @apply text-2xl md:text-3xl font-medium tracking-tight;
}

.heading-small {
  @apply text-sm opacity-60 tracking-wide uppercase;
}

/* Body */
.body-text {
  @apply text-sm;
}

/* Labels */
.label {
  @apply text-xs border border-black px-2 py-0.5 opacity-60;
}
```

**Layout:**
```css
/* Container */
.container-main {
  @apply min-h-screen p-8 md:p-12 lg:p-16;
}

/* Grid */
.product-grid {
  @apply grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8;
}

/* Product Card */
.product-card {
  @apply group cursor-pointer;
}

/* Product Image */
.product-image {
  @apply aspect-[3/4] bg-gray-100 mb-3 overflow-hidden border border-black;
}

.product-image img {
  @apply w-full h-full object-cover group-hover:opacity-75 transition-opacity;
}
```

**Colors:**
- Background: `#ffffff` (white)
- Foreground: `#000000` (black)
- Border: `border-black`
- Subtle text: `opacity-60`
- Very subtle: `opacity-40`

**Interactions:**
- Hover: `group-hover:opacity-75 transition-opacity`
- Focus: `focus:outline-none`
- Active states: Minimal, clean

---

### 3.4 Data Fetching Strategy

**Priority:** High
**Effort:** Low

#### 3.4.1 Query Specification

**Supabase Query:**
```typescript
const { data } = await supabase
  .from('article')
  .select(`
    *,
    category:categories(id, name, slug),
    size:sizes(id, name, slug),
    tag:tags(id, name, slug)
  `)
  .eq('in_stock', true)  // Only in-stock items
  .order('created_at', { ascending: false })  // Newest first
```

**Filters:**
- `in_stock = true` - Only show available products
- Sort by `created_at DESC` - Newest products first
- Join with categories, sizes, tags for display

---

#### 3.4.2 Performance Considerations

**Optimization:**
- Context fetches once on mount
- All components consume from context (no re-fetching)
- `refreshProducts()` method for manual refresh
- Consider adding pagination for 100+ products (future)

**Caching:**
- Client-side state in Context
- No server-side caching initially
- Consider React Query or SWR for future enhancements

---

## 4. User Stories

### 4.1 Product Display

**US-001:** As a visitor, I want to see products on the homepage so that I can browse the shop.

**Acceptance Criteria:**
- Homepage displays product grid
- Each product shows image, title, price
- Grid is responsive (1/3/4 columns)
- Only in-stock items shown

**US-002:** As a visitor, I want to see product details like size and category so that I can find what I need.

**Acceptance Criteria:**
- Product cards show category badge
- Size displayed as badge
- Tag displayed if present
- All info clearly readable

---

### 4.2 State Management

**US-003:** As a developer, I want products in global state so that I don't need to fetch them multiple times.

**Acceptance Criteria:**
- ProductContext provides products
- Context fetches once on app load
- `useProducts()` hook available in any component
- Loading and error states handled

---

### 4.3 User Experience

**US-004:** As a visitor, I want to see loading feedback while products load so that I know the page is working.

**Acceptance Criteria:**
- Loading spinner or message shown
- Smooth transition when products load
- No layout shift during load

**US-005:** As a visitor, I want to see helpful messages if no products are available.

**Acceptance Criteria:**
- Empty state message shown
- Clear error message if fetch fails
- Consistent styling with rest of site

---

## 5. Technical Specifications

### 5.1 File Structure

```
/context
└── ProductContext.tsx (NEW)
    ├── ProductProvider component
    ├── useProducts hook
    └── Type definitions

/app
├── layout.tsx (UPDATE)
│   └── Wrap children with ProductProvider
└── page.tsx (REPLACE)
    └── Product grid component

/types
└── database.ts (EXISTS)
    └── Article, Category, Size, Tag interfaces
```

---

### 5.2 Type Definitions

**Context Types:**

```typescript
interface ProductContextType {
  products: Article[]
  loading: boolean
  error: string | null
  refreshProducts: () => Promise<void>
  filterProducts: (filters: ProductFilters) => Article[]
}

interface ProductFilters {
  category?: string
  tag?: string
  size?: string
  inStock?: boolean
  forSale?: boolean
}
```

**Article Type (existing):**

```typescript
interface Article {
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
  category_id?: number | null
  tag_id?: number | null
  size_id?: number | null
  // Joined relations
  category?: Category
  tag?: Tag
  size?: Size
}
```

---

### 5.3 Component Hierarchy

```
RootLayout
└── ProductProvider (Context)
    └── HomePage
        ├── Header
        └── ProductGrid
            └── ProductCard (repeated)
                ├── ProductImage
                └── ProductInfo
                    ├── Title
                    ├── Price
                    └── Tags
```

---

## 6. Implementation Plan

### Phase 1: Context Setup (Day 1)

**Tasks:**
1. Create `/context/ProductContext.tsx`
2. Implement ProductProvider component
3. Add `useProducts` hook
4. Implement Supabase fetch logic
5. Add loading/error state handling
6. Test context in isolation

**Deliverables:**
- ✅ ProductContext file created
- ✅ Context provider functional
- ✅ Hook exports working
- ✅ Data fetches successfully

---

### Phase 2: Root Layout Update (Day 1)

**Tasks:**
1. Update `/app/layout.tsx`
2. Import ProductProvider
3. Wrap children with provider
4. Test provider wraps all pages
5. Update metadata (title/description)

**Deliverables:**
- ✅ Provider wraps entire app
- ✅ Metadata updated
- ✅ No TypeScript errors

---

### Phase 3: Homepage Product Grid (Day 2)

**Tasks:**
1. Replace `/app/page.tsx`
2. Implement loading state
3. Implement error state
4. Implement empty state
5. Implement product grid
6. Style with Tailwind classes
7. Test responsive layout

**Deliverables:**
- ✅ Product grid displays
- ✅ Responsive (mobile/tablet/desktop)
- ✅ All states handled (loading/error/empty)
- ✅ Styling matches admin reference

---

### Phase 4: Polish & Testing (Day 3)

**Tasks:**
1. Test with 0 products (empty state)
2. Test with 1-10 products
3. Test with 50+ products
4. Test loading performance
5. Test error handling (disconnect network)
6. Mobile responsive testing
7. Cross-browser testing

**Deliverables:**
- ✅ All edge cases handled
- ✅ Mobile layout perfect
- ✅ Performance acceptable
- ✅ Error states user-friendly

---

## 7. Testing Strategy

### 7.1 Unit Tests

**Context Tests:**
- ProductProvider renders without errors
- `useProducts` throws error outside provider
- Products fetch on mount
- Loading state changes correctly
- Error state handles failures
- `filterProducts` filters correctly
- `refreshProducts` re-fetches data

**Component Tests:**
- HomePage renders loading state
- HomePage renders error state
- HomePage renders empty state
- HomePage renders product grid
- Product cards display all info
- Images handle missing `img_url`

---

### 7.2 Integration Tests

**Full Flow:**
1. App loads
2. ProductProvider fetches products
3. Loading state shown
4. Products load successfully
5. Grid displays products
6. All product info visible
7. Hover effects work

**Error Scenarios:**
1. Network failure during fetch
2. Supabase returns error
3. Invalid product data
4. Missing images
5. Empty product list

---

### 7.3 Manual Testing Checklist

**Functionality:**
- [ ] Homepage loads successfully
- [ ] Loading state displays
- [ ] Products display in grid
- [ ] All product info visible (title, price, tags)
- [ ] Images load correctly
- [ ] Missing images show placeholder
- [ ] Empty state works (no products)
- [ ] Error state works (network error)

**Styling:**
- [ ] Grid is responsive (1/3/4 columns)
- [ ] Images maintain 3:4 aspect ratio
- [ ] Hover effects work
- [ ] Typography consistent
- [ ] Borders and spacing correct
- [ ] Mobile layout perfect
- [ ] Tablet layout perfect

**Performance:**
- [ ] Initial load < 2 seconds
- [ ] Products fetch once (not multiple times)
- [ ] No layout shift during load
- [ ] Images load progressively
- [ ] Smooth animations

---

## 8. Success Metrics

### 8.1 Completion Criteria

**Phase 1-2:**
- [ ] ProductContext created and working
- [ ] Provider wraps root layout
- [ ] `useProducts` hook accessible

**Phase 3:**
- [ ] Homepage displays product grid
- [ ] All states implemented (loading/error/empty/success)
- [ ] Styling matches design system

**Phase 4:**
- [ ] All tests passing
- [ ] Mobile responsive
- [ ] Performance targets met

---

### 8.2 Performance Targets

- Initial page load: < 2 seconds
- Products fetch: < 1 second
- Image load: < 500ms per image
- Responsive layout: No jank/shift

---

### 8.3 Quality Targets

- Zero console errors
- No TypeScript errors
- 100% responsive (mobile/tablet/desktop)
- Consistent styling with admin interface

---

## 9. Future Enhancements

### 9.1 Phase 2 Features (Not in Current Scope)

**Product Detail Page:**
- Click product card to view details
- Full product information
- Multiple images gallery
- Add to cart (future e-commerce)

**Filtering & Sorting:**
- Filter by category
- Filter by size
- Filter by tag
- Filter by price range
- Sort by price/date/name

**Search:**
- Search bar in header
- Search by title/description
- Real-time search results

**Pagination:**
- Load more button
- Infinite scroll
- Page numbers

**Header Navigation:**
- Logo
- Category menu
- Search bar
- Cart icon (future)

**Performance:**
- Image lazy loading
- Virtual scrolling for large lists
- React Query for caching
- Optimistic updates

---

## 10. Glossary

| Term | Definition |
|------|------------|
| **Context** | React Context API for global state management |
| **ProductProvider** | Context provider component wrapping app |
| **useProducts** | Custom hook for accessing product context |
| **Article** | Database table/type for products |
| **In Stock** | Product availability (boolean field) |
| **3:4 Aspect Ratio** | Image dimensions (portrait, like Instagram) |

---

## 11. Related Documents

- **Main PRD:** `/home/user/jojo-web-playground/prd.md` - Comprehensive CMS enhancements
- **Image PRD:** `/home/user/jojo-web-playground/prd-image-improvements.md` - Image management
- **Admin Products:** `/home/user/jojo-web-playground/app/admin/products/page.tsx` - Reference styling
- **Types:** `/home/user/jojo-web-playground/types/database.ts` - Data types

---

## 12. Appendix

### 12.1 Tailwind Class Reference

**Grid Layouts:**
```
grid-cols-1                  // 1 column (mobile)
md:grid-cols-3              // 3 columns (tablet)
lg:grid-cols-4              // 4 columns (desktop)
gap-8                       // 2rem gap between items
```

**Image Styling:**
```
aspect-[3/4]                // 3:4 aspect ratio
object-cover                // Cover entire container
group-hover:opacity-75      // 75% opacity on hover
transition-opacity          // Smooth transition
```

**Typography:**
```
text-sm                     // Small text (14px)
text-2xl md:text-3xl        // Responsive heading
font-medium                 // Medium weight
tracking-tight              // Tighter letter spacing
tracking-wide               // Wider letter spacing
opacity-60                  // 60% opacity (subtle text)
opacity-40                  // 40% opacity (very subtle)
```

**Spacing:**
```
p-8 md:p-12 lg:p-16        // Responsive padding
mb-3                        // Margin bottom 0.75rem
space-y-1                   // Vertical spacing between children
```

---

### 12.2 Example Product Card Structure

```tsx
<div className="group cursor-pointer">
  {/* Image Container */}
  <div className="aspect-[3/4] bg-gray-100 mb-3 overflow-hidden border border-black">
    <img
      src={imageUrl}
      className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
    />
  </div>

  {/* Info Container */}
  <div className="text-sm space-y-1">
    {/* Title */}
    <div className="font-medium tracking-tight">
      Product Title
    </div>

    {/* Price */}
    <div className="opacity-60">
      $99
    </div>

    {/* Tags */}
    <div className="flex flex-wrap gap-2 mt-2">
      <span className="text-xs border border-black px-2 py-0.5 opacity-60">
        Female
      </span>
      <span className="text-xs border border-black px-2 py-0.5 opacity-60">
        M
      </span>
    </div>
  </div>
</div>
```

---

## 13. Document Control

**Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-10 | Product Team | Initial PRD for product grid & context |

**Approval:**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | TBD | | |
| Tech Lead | TBD | | |
| Designer | TBD | | |

---

**END OF DOCUMENT**
