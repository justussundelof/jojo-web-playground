# Product Requirements Document (PRD)
## JOJO Vintage Shop - Admin CMS Enhancement

**Version:** 1.0
**Date:** 2025-12-10
**Project:** JOJO Web Playground
**Document Owner:** Product Team

---

## 1. Executive Summary

This PRD outlines the enhancement requirements for the JOJO Vintage Shop admin CMS system. The project will transition the platform from USD to SEK currency, implement full CRUD operations for products, enhance image management, add a comprehensive measurements system for clothing items, and improve the tag management system to support future rental functionality.

---

## 2. Project Context

### 2.1 Current State
- **Tech Stack:** Next.js 16, React 19, TypeScript, Supabase, Cloudinary
- **Currency:** USD (hardcoded)
- **CRUD Status:** Create and Read implemented, Update and Delete missing
- **Images:** Single image per product
- **Designer Field:** Currently in use but to be removed
- **Tags:** Fixed set of tags, no admin creation capability
- **Measurements:** Not implemented

### 2.2 Goals
1. Localize the platform for Swedish market (SEK currency)
2. Complete CRUD operations for products
3. Enable multiple images per product
4. Implement comprehensive measurement system for clothing
5. Simplify product data model (remove designer)
6. Enable dynamic tag creation
7. Prepare platform for future rental functionality

---

## 3. Requirements

### 3.1 Currency Conversion (USD → SEK)

**Priority:** High
**Effort:** Medium

#### 3.1.1 Functional Requirements

**FR-CUR-001:** Replace all USD references with SEK
- Update all price display components to show "kr" instead of "$"
- Swedish format: `price kr` (e.g., "299 kr")
- Remove currency field assumptions

**FR-CUR-002:** Integer-only price inputs
- Remove decimal input support (`step="0.01"` → `step="1"`)
- Remove decimal places from all price displays
- Validation: Only accept positive integers
- No thousand separators or commas in input

**FR-CUR-003:** Database price type adjustment
- Keep NUMERIC type but enforce integer values at application level
- Update existing USD prices to equivalent SEK values (multiply by ~10.5)
- All future prices stored as integer SEK values

#### 3.1.2 Technical Implementation

**Affected Files:**
- `/app/admin/products/page.tsx` - Product list price display
- `/app/admin/products/[id]/page.tsx` - Product detail price display
- `/app/admin/products/add/page.tsx` - Price input field
- Future: `/app/admin/products/[id]/edit/page.tsx` - Edit form price input

**Example Implementation:**
```tsx
// Price Input (Add/Edit Forms)
<input
  type="number"
  name="price"
  step="1"
  min="0"
  pattern="[0-9]*"
  placeholder="299"
/>

// Price Display
<div>{product.price} kr</div>
```

#### 3.1.3 User Experience
- Users see prices as whole numbers only (e.g., 299, 450, 1200)
- No decimal points or commas in any price field
- Validation message: "Endast heltal tillåtna" (Only integers allowed)

---

### 3.2 CRUD Operations Completion

**Priority:** High
**Effort:** High

#### 3.2.1 Edit Product Page

**FR-CRUD-001:** Create product edit page at `/admin/products/[id]/edit`

**Features:**
- Pre-populate form with existing product data
- Two-column layout matching add page:
  - Left: Current product image with option to replace
  - Right: Editable form fields
- "Save Changes" button
- "Cancel" button (returns to detail view)
- Success message: "Produkt uppdaterad" (Product updated)
- Error handling for failed updates

**Form Fields:**
- Title (text, required)
- Description (textarea, optional)
- Price (number, integer only, SEK, required)
- Category (dropdown, required)
- Size (dropdown, required)
- Tag (dropdown, optional)
- For Sale/Rent toggle (boolean, required)
- In Stock toggle (boolean, required)
- Width (text, cm, optional)
- Height (text, cm, optional)
- Measurements (conditional fields based on category - see 3.6)
- Images (multiple upload/manage - see 3.4)

**API Endpoint:**
- `PUT /api/products/[id]` or Supabase update query
- Validates all required fields
- Updates `article` table
- Returns updated product object

**Navigation:**
- Accessible from product detail page "Edit Product" button
- After save: Redirect to product detail page

---

#### 3.2.2 Delete Product Functionality

**FR-CRUD-002:** Implement product deletion

**Features:**
- Delete button on product detail page
- Confirmation modal before deletion:
  - Title: "Radera produkt?" (Delete product?)
  - Message: "Är du säker på att du vill radera denna produkt? Detta kan inte ångras." (Are you sure you want to delete this product? This cannot be undone.)
  - Buttons: "Avbryt" (Cancel) and "Radera" (Delete, red/danger style)
- Delete images from Cloudinary when product is deleted
- Success message: "Produkt raderad" (Product deleted)
- After deletion: Redirect to products list

**API Endpoint:**
- `DELETE /api/products/[id]` or Supabase delete query
- Cascade delete or handle foreign key constraints
- Delete associated images from Cloudinary using Admin API
- Return success/error status

**Error Handling:**
- Network errors: Retry with user notification
- Permission errors: Show access denied message
- Cloudinary deletion failures: Log but proceed with database deletion

---

### 3.3 Designer Field Removal

**Priority:** Medium
**Effort:** Low

#### 3.3.1 Functional Requirements

**FR-DES-001:** Remove designer field from product data model

**Changes Required:**
1. Remove designer input from add product form (`/app/admin/products/add/page.tsx`)
2. Remove designer display from product list (`/app/admin/products/page.tsx`)
3. Remove designer display from product detail (`/app/admin/products/[id]/page.tsx`)
4. Remove designer from edit form (when created)
5. Remove designer from TypeScript interfaces (`/types/product.ts`)
6. Database: Keep column for historical data but exclude from queries

**Migration Strategy:**
- Do not drop `designer` column from database (preserve historical data)
- Exclude from SELECT queries and form interfaces
- Document as deprecated field

**Alternative Approach:**
- If designer data is valuable, consider moving to tags system
- Example tags: "Yohji Yamamoto", "Vintage Levi's"
- But based on requirements, removal is preferred

---

### 3.4 Multiple Image Support

**Priority:** High
**Effort:** High

#### 3.4.1 Functional Requirements

**FR-IMG-001:** Support multiple images per product (minimum 1, maximum 8)

**Database Schema Changes:**
```sql
CREATE TABLE product_images (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES article(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one primary image per product
CREATE UNIQUE INDEX idx_one_primary_per_product
ON product_images (article_id)
WHERE is_primary = TRUE;
```

**Migration:**
- Migrate existing `img_url` data to `product_images` table
- Set migrated images as `is_primary = TRUE`
- Keep `img_url` column for backwards compatibility initially

---

#### 3.4.2 Image Upload & Management

**FR-IMG-002:** Enhanced image upload interface

**Add/Edit Product Form:**
- Multiple capture/upload zones (max 8 images)
- First image automatically marked as primary
- Ability to reorder images (drag-and-drop or up/down buttons)
- Delete individual images
- Visual indicator for primary image
- All images uploaded to Cloudinary with same naming convention

**Image Gallery Display:**
```
[Primary Image - Large]
[Thumbnail 2] [Thumbnail 3] [Thumbnail 4] [Thumbnail 5]
```

**Technical Details:**
- Use same PhotoCapture component, allow multiple captures
- Store captured images in state array before submission
- Upload all images to Cloudinary on form submit
- Store URLs in `product_images` table with `display_order`

---

#### 3.4.3 Image Display

**FR-IMG-003:** Display multiple images elegantly

**Product Detail Page:**
- Main image display (large, 3:4 aspect ratio)
- Thumbnail gallery below main image
- Click thumbnail to change main image
- Mobile: Swipeable image carousel
- Desktop: Click to navigate

**Product List/Grid:**
- Show only primary image
- Hover effect: Quick preview of additional images (optional enhancement)

**Layout Example:**
```
┌─────────────────────┐
│                     │
│   Main Image        │
│   (3:4 ratio)       │
│                     │
└─────────────────────┘
┌───┐ ┌───┐ ┌───┐ ┌───┐
│ 1 │ │ 2 │ │ 3 │ │ 4 │
└───┘ └───┘ └───┘ └───┘
```

---

### 3.5 Dynamic Tag Creation

**Priority:** Medium
**Effort:** Medium

#### 3.5.1 Functional Requirements

**FR-TAG-001:** Enable admin to create new tags from product form

**Features:**
- Tag dropdown with existing tags
- "+ Skapa ny tagg" (+ Create new tag) option at bottom of dropdown
- Modal for new tag creation:
  - Input: Tag name
  - Auto-generate slug from name (lowercase, hyphenated)
  - "Skapa" (Create) button
  - "Avbryt" (Cancel) button
- After creation: New tag automatically selected in form
- Tag list refreshes to include new tag

**Validation:**
- Tag name required
- Check for duplicate tag names
- Slug uniqueness enforced at database level
- Minimum length: 2 characters
- Maximum length: 50 characters

**API Endpoint:**
- `POST /api/tags`
- Request: `{ name: string }`
- Response: `{ id, name, slug, created_at }`
- Error: `{ error: "Tag already exists" }`

---

#### 3.5.2 Tag Management Page (Optional Enhancement)

**FR-TAG-002:** Dedicated tag management interface (future enhancement)

**Location:** `/admin/tags`

**Features:**
- List all tags
- Edit tag name
- Delete tag (only if not in use)
- Usage count per tag

---

### 3.6 Product Measurements System

**Priority:** High
**Effort:** High

#### 3.6.1 Functional Requirements

**FR-MEA-001:** Implement flexible measurement system for clothing items

**Database Schema:**
```sql
CREATE TABLE product_measurements (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES article(id) ON DELETE CASCADE,
  measurement_type VARCHAR(100) NOT NULL,  -- e.g., 'shoulder_width', 'inseam'
  value NUMERIC NOT NULL,                  -- measurement value
  unit VARCHAR(10) DEFAULT 'cm',           -- unit of measurement
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, measurement_type)
);
```

**Alternative (JSON Column):**
```sql
ALTER TABLE article ADD COLUMN measurements JSONB;

-- Example data structure:
{
  "shoulder_width": 42,
  "chest_width": 52,
  "sleeve_length": 64,
  "garment_length": 68
}
```

**Recommended:** JSONB column for flexibility and simpler queries.

---

#### 3.6.2 Measurement Types by Category

**FR-MEA-002:** Category-specific measurement fields

**Jacka, Tröja, Topp, Blus, Skjorta** (Jacket, Sweater, Top, Blouse, Shirt):
- `shoulder_width` - Axel till axel (cm)
- `chest_width` - Armhåla till armhåla / bröstbredd (cm)
- `sleeve_length` - Ärmlängd från axelsöm (cm)
- `garment_length` - Plagglängd från axel till nederkant (cm)

**Byxor** (Pants/Trousers):
- `waist_width` - Midjebredd liggande, rak linje (cm)
- `hip_width` - Höftbredd (cm)
- `inseam` - Innerbenslängd (cm)
- `outseam` - Ytterbenslängd (cm)
- `rise` - Grenhöjd (cm)
- `leg_opening` - Benslut / vidd nertill (cm)

**Kjol** (Skirt):
- `waist_width` - Midjebredd (cm)
- `garment_length` - Längd (cm)

**Klänning** (Dress):
- `shoulder_width` - Axel till axel (cm)
- `chest_width` - Armhåla till armhåla (cm)
- `waist_width` - Midjebredd (cm)
- `hip_width` - Höftbredd (cm)
- `garment_length` - Plagglängd (cm)
- `sleeve_length` - Ärmlängd (optional) (cm)
- `slit_length` - Slits (optional) (cm)

---

#### 3.6.3 Measurement Input UI

**FR-MEA-003:** Dynamic measurement form based on category

**User Flow:**
1. User selects category from dropdown
2. Form dynamically shows relevant measurement fields
3. All measurements in centimeters (cm)
4. Integer or decimal inputs (step="0.1" for precision)
5. Visual guide: Small diagram showing where to measure (optional enhancement)

**Example UI:**
```
┌────────────────────────────────────────┐
│ CATEGORY: Tröja (Sweater)              │
└────────────────────────────────────────┘

Measurements (in cm):

┌─────────────────────┐
│ Axel till axel      │
│ [_______] cm        │
└─────────────────────┘

┌─────────────────────┐
│ Bröstbredd          │
│ [_______] cm        │
└─────────────────────┘

┌─────────────────────┐
│ Ärmlängd            │
│ [_______] cm        │
└─────────────────────┘

┌─────────────────────┐
│ Plagglängd          │
│ [_______] cm        │
└─────────────────────┘
```

**Technical Implementation:**
- Measurement fields shown/hidden based on category selection
- Use TypeScript union types for measurement types per category
- Validation: Positive numbers only, reasonable ranges (e.g., 10-200 cm)

---

#### 3.6.4 Measurement Display

**FR-MEA-004:** Display measurements clearly on product pages

**Product Detail Page:**
```
┌────────────────────────────────────────┐
│ MEASUREMENTS                           │
├────────────────────────────────────────┤
│ Axel till axel: 42 cm                  │
│ Bröstbredd: 52 cm                      │
│ Ärmlängd: 64 cm                        │
│ Plagglängd: 68 cm                      │
└────────────────────────────────────────┘
```

**Product List:**
- Measurements not shown (too detailed for grid view)
- Available on detail page only

---

### 3.7 For Sale / For Rent Feature Enhancement

**Priority:** Medium
**Effort:** Medium

#### 3.7.1 Current State
- `for_sale` boolean field exists
- Currently used as simple true/false flag
- No distinction between sale and rent

#### 3.7.2 Functional Requirements

**FR-SAL-001:** Repurpose `for_sale` field to distinguish sale vs. rent

**Approach 1: Keep Boolean (Immediate)**
- `for_sale = true` → Product is for SALE
- `for_sale = false` → Product is for RENT
- Add clear labeling in forms and displays

**Approach 2: Enum Column (Future-proof)**
```sql
CREATE TYPE listing_type AS ENUM ('sale', 'rent');
ALTER TABLE article ADD COLUMN listing_type listing_type DEFAULT 'sale';
```

**Recommended:** Approach 1 for immediate implementation, plan migration to Approach 2 when rental functionality is built.

---

#### 3.7.3 User Interface

**Add/Edit Product Form:**
```
┌────────────────────────────────────────┐
│ LISTING TYPE                           │
├────────────────────────────────────────┤
│ ○ Till salu (For Sale)                 │
│ ○ Uthyrning (For Rent)                 │
└────────────────────────────────────────┘
```

**Product Display:**
- Sale products: Normal display
- Rent products: Badge or label indicating "UTHYRNING" (Rent)
- Different styling to distinguish (e.g., rent items have subtle icon)

**Future Frontend Consideration:**
- Homepage may show sale and rent items separately
- Filter/tabs: "Till salu" | "Uthyrning"
- CMS (admin system) stays unified - same forms for both types

---

#### 3.7.4 Rental Feature Preparation

**FR-SAL-002:** Design database schema to support future rental functionality

**Future Tables (Not Implemented Yet):**
```sql
-- Rental pricing and terms
CREATE TABLE rental_terms (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT REFERENCES article(id),
  daily_rate NUMERIC,
  weekly_rate NUMERIC,
  monthly_rate NUMERIC,
  min_rental_days INTEGER,
  max_rental_days INTEGER,
  deposit_amount NUMERIC
);

-- Rental bookings (future)
CREATE TABLE rentals (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT REFERENCES article(id),
  user_id BIGINT REFERENCES users(id),
  start_date DATE,
  end_date DATE,
  total_price NUMERIC,
  deposit_paid NUMERIC,
  status VARCHAR(50),  -- pending, active, completed, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Current Scope:**
- Only implement `for_sale` boolean toggle
- Document architecture for future rental pricing and booking system
- Ensure data model doesn't block future rental expansion

---

### 3.8 Context7.com Integration

**Priority:** Low
**Effort:** To Be Determined

#### 3.8.1 Research Required

**FR-CON-001:** Investigate Context7.com integration

**Questions:**
- What is Context7.com? (Context/requirement unclear from user input)
- Is it a payment processor, analytics tool, or other service?
- What specific integration is needed?

**Action Items:**
- User to provide Context7.com documentation
- Define integration scope
- Assess if it's for:
  - Payment processing (Stripe/Klarna alternative?)
  - Inventory management?
  - Customer context tracking?
  - Other functionality?

**Status:** Pending clarification from stakeholders.

---

## 4. User Stories

### 4.1 Currency & Localization

**US-001:** As an admin, I want to enter prices in SEK without decimals so that prices match Swedish currency conventions.

**Acceptance Criteria:**
- Price input only accepts integers
- Price displays show "kr" instead of "$"
- Format: "299 kr" not "$299" or "299.00 kr"

---

### 4.2 CRUD Operations

**US-002:** As an admin, I want to edit existing products so that I can correct mistakes or update information.

**Acceptance Criteria:**
- Edit button navigates to edit form
- Form pre-populated with current data
- Save button updates product
- Success message shown
- Redirects to product detail after save

**US-003:** As an admin, I want to delete products no longer in inventory so that the catalog stays current.

**Acceptance Criteria:**
- Delete button shows confirmation modal
- Confirmation required before deletion
- Product and images deleted
- Redirects to product list
- Success message shown

---

### 4.3 Multiple Images

**US-004:** As an admin, I want to upload multiple images per product so that customers can see different angles and details.

**Acceptance Criteria:**
- Can add 1-8 images per product
- First image is primary image
- Can reorder images
- Can delete individual images
- All images stored in Cloudinary

**US-005:** As a customer (future), I want to view multiple product images so that I can better assess the item.

**Acceptance Criteria:**
- Main image displayed prominently
- Thumbnail gallery shown below
- Click thumbnail to change main image
- Mobile: swipe to navigate images

---

### 4.4 Tags

**US-006:** As an admin, I want to create new tags without database access so that I can categorize products flexibly.

**Acceptance Criteria:**
- "+ Skapa ny tagg" option in dropdown
- Modal opens for tag creation
- New tag appears in dropdown immediately
- New tag auto-selected in form

---

### 4.5 Measurements

**US-007:** As an admin, I want to enter detailed measurements for clothing items so that customers know exact sizing.

**Acceptance Criteria:**
- Measurement fields appear based on category
- Different fields for jackets, pants, skirts, dresses
- All measurements in centimeters
- Measurements saved to database
- Measurements displayed on product detail page

**US-008:** As a customer (future), I want to see precise measurements so that I can determine if the item will fit.

**Acceptance Criteria:**
- Measurements clearly labeled (Swedish terms)
- All values shown with "cm" unit
- Easy to read format
- Only relevant measurements shown per category

---

### 4.6 Sale vs. Rent

**US-009:** As an admin, I want to mark products as "for sale" or "for rent" so that I can offer both purchase and rental options.

**Acceptance Criteria:**
- Toggle or radio button for Sale/Rent
- Clear labeling: "Till salu" / "Uthyrning"
- Rent items visually distinguished
- Data saved correctly to `for_sale` field

---

## 5. Technical Specifications

### 5.1 Database Schema Changes

#### New Tables:

```sql
-- Multiple images support
CREATE TABLE product_images (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES article(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_one_primary_per_product
ON product_images (article_id, is_primary)
WHERE is_primary = TRUE;

CREATE INDEX idx_product_images_article
ON product_images(article_id);
```

#### Modified Tables:

```sql
-- Add measurements as JSONB
ALTER TABLE article ADD COLUMN measurements JSONB DEFAULT '{}';

-- Add index for JSON queries (if needed)
CREATE INDEX idx_article_measurements ON article USING GIN (measurements);

-- Example measurements data:
-- {
--   "shoulder_width": 42,
--   "chest_width": 52,
--   "sleeve_length": 64,
--   "garment_length": 68
-- }
```

---

### 5.2 API Endpoints

#### Product CRUD:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/products` | Create product (existing) |
| GET | `/api/products` | List all products (existing) |
| GET | `/api/products/[id]` | Get single product (existing) |
| PUT | `/api/products/[id]` | **NEW:** Update product |
| DELETE | `/api/products/[id]` | **NEW:** Delete product |

#### Image Management:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/products/[id]/images` | **NEW:** Add image to product |
| DELETE | `/api/images/[id]` | **NEW:** Delete specific image |
| PUT | `/api/products/[id]/images/reorder` | **NEW:** Reorder images |

#### Tag Management:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/tags` | List all tags (existing) |
| POST | `/api/tags` | **NEW:** Create new tag |

---

### 5.3 TypeScript Type Updates

```typescript
// Updated Article interface
interface Article {
  id?: number
  created_at?: string
  title?: string | null
  // designer removed from active use
  description?: string | null
  price?: number | null  // Integer only, in SEK
  width?: string | null
  height?: string | null
  in_stock?: boolean
  for_sale?: boolean  // true = sale, false = rent
  img_url?: string | null  // Deprecated, keep for migration
  category_id?: number | null
  tag_id?: number | null
  size_id?: number | null
  measurements?: ProductMeasurements | null  // NEW
  // Joined relations
  category?: Category
  tag?: Tag
  size?: Size
  images?: ProductImage[]  // NEW
}

// New: Multiple images
interface ProductImage {
  id: number
  article_id: number
  image_url: string
  display_order: number
  is_primary: boolean
  created_at: string
}

// New: Measurements type
type ProductMeasurements =
  | TopMeasurements
  | PantsMeasurements
  | SkirtMeasurements
  | DressMeasurements

interface TopMeasurements {
  shoulder_width?: number      // Axel till axel
  chest_width?: number          // Bröstbredd
  sleeve_length?: number        // Ärmlängd
  garment_length?: number       // Plagglängd
}

interface PantsMeasurements {
  waist_width?: number          // Midjebredd
  hip_width?: number            // Höftbredd
  inseam?: number               // Innerbenslängd
  outseam?: number              // Ytterbenslängd
  rise?: number                 // Grenhöjd
  leg_opening?: number          // Benslut
}

interface SkirtMeasurements {
  waist_width?: number          // Midjebredd
  garment_length?: number       // Längd
}

interface DressMeasurements {
  shoulder_width?: number       // Axel till axel
  chest_width?: number          // Armhåla till armhåla
  waist_width?: number          // Midjebredd
  hip_width?: number            // Höftbredd
  garment_length?: number       // Plagglängd
  sleeve_length?: number        // Ärmlängd (optional)
  slit_length?: number          // Slits (optional)
}
```

---

### 5.4 Component Architecture

#### New Components:

```
/components
├── ImageGallery.tsx          # Display multiple product images
├── ImageUploadMultiple.tsx   # Multi-image capture/upload
├── MeasurementFields.tsx     # Dynamic measurement inputs
├── TagSelect.tsx             # Tag dropdown with create option
├── ConfirmModal.tsx          # Reusable confirmation modal
└── ProductForm.tsx           # Shared form for add/edit
```

#### Modified Pages:

```
/app/admin/products
├── add/page.tsx              # Update to use ProductForm component
├── [id]/page.tsx             # Add edit/delete buttons, image gallery
└── [id]/edit/page.tsx        # NEW: Edit product page
```

---

### 5.5 Validation Rules

#### Price:
- Type: Integer
- Min: 0
- Max: 999999
- Currency: SEK only
- Format: No decimals, no commas

#### Measurements:
- Type: Number (decimal allowed)
- Min: 0
- Max: 500 (reasonable max for clothing in cm)
- Unit: cm (centimeters)
- Precision: 0.1 cm

#### Images:
- Min: 1 image required
- Max: 8 images per product
- Format: JPEG, PNG, WebP
- Max file size: 10MB per image
- Aspect ratio: Flexible, but 3:4 recommended

#### Tags:
- Name length: 2-50 characters
- Unique names (case-insensitive check)
- Slug: Auto-generated from name
- Pattern: `[a-z0-9-]+`

---

## 6. User Interface Mockups

### 6.1 Add/Edit Product Form Layout

```
┌────────────────────────────────────────────────────────────────────┐
│ ADMIN / PRODUCTS / ADD PRODUCT                                     │
└────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐  ┌─────────────────────────────────────┐
│                         │  │ TITLE                               │
│                         │  │ [________________________]          │
│   IMAGE UPLOAD ZONE     │  │                                     │
│   (Multiple)            │  │ DESCRIPTION                         │
│                         │  │ [________________________]          │
│   [Image 1]             │  │ [________________________]          │
│   [Image 2] [+Add]      │  │                                     │
│                         │  │ PRICE                               │
│   Reorder: ↑↓           │  │ [_______] kr                        │
│                         │  │                                     │
│                         │  │ CATEGORY                            │
│                         │  │ [Dropdown: Female > Clothing ▼]    │
│                         │  │                                     │
│                         │  │ SIZE                                │
│                         │  │ [Dropdown: M ▼]                    │
│                         │  │                                     │
│                         │  │ TAG                                 │
│                         │  │ [Dropdown: Y2K ▼]                  │
│                         │  │ [+ Skapa ny tagg]                  │
│                         │  │                                     │
│                         │  │ LISTING TYPE                        │
│                         │  │ ○ Till salu  ○ Uthyrning           │
│                         │  │                                     │
│                         │  │ IN STOCK                            │
│                         │  │ [✓] I lager                        │
│                         │  │                                     │
│                         │  │ ─── MEASUREMENTS ───                │
│                         │  │ (Dynamic based on category)         │
│                         │  │ Axel till axel: [___] cm           │
│                         │  │ Bröstbredd: [___] cm               │
│                         │  │ Ärmlängd: [___] cm                 │
│                         │  │ Plagglängd: [___] cm               │
│                         │  │                                     │
│                         │  │ [SPARA PRODUKT]                    │
└─────────────────────────┘  └─────────────────────────────────────┘
```

---

### 6.2 Product Detail Page with Multiple Images

```
┌────────────────────────────────────────────────────────────────────┐
│ ADMIN / PRODUCTS / VINTAGE LEVI'S JACKET                           │
└────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐  ┌─────────────────────────────────────┐
│                         │  │ VINTAGE LEVI'S JACKET               │
│                         │  │                                     │
│     MAIN IMAGE          │  │ 450 kr                              │
│     (Primary)           │  │                                     │
│                         │  │ Classic denim jacket in excellent   │
│                         │  │ condition. True vintage piece.      │
│                         │  │                                     │
│                         │  │ ─── DETAILS ───                     │
└─────────────────────────┘  │ Category: Female > Clothing         │
                             │ Size: M                              │
┌───┐ ┌───┐ ┌───┐ ┌───┐    │ Tag: Vintage                        │
│ 1 │ │ 2 │ │ 3 │ │ 4 │    │ Status: Till salu                   │
└───┘ └───┘ └───┘ └───┘    │ In stock: Ja                        │
  ▲                         │                                      │
(Active)                    │ ─── MEASUREMENTS ───                 │
                             │ Axel till axel: 42 cm               │
                             │ Bröstbredd: 52 cm                   │
                             │ Ärmlängd: 64 cm                     │
                             │ Plagglängd: 68 cm                   │
                             │                                      │
                             │ [EDIT PRODUCT]  [DELETE PRODUCT]    │
                             └─────────────────────────────────────┘
```

---

### 6.3 Create New Tag Modal

```
┌────────────────────────────────────────┐
│  Skapa ny tagg                    [X]  │
├────────────────────────────────────────┤
│                                        │
│  TAG NAME                              │
│  [_____________________________]       │
│                                        │
│  Exempel: Vintage, Sommar, Y2K         │
│                                        │
│             [AVBRYT]  [SKAPA]          │
└────────────────────────────────────────┘
```

---

### 6.4 Delete Confirmation Modal

```
┌────────────────────────────────────────┐
│  Radera produkt?                  [X]  │
├────────────────────────────────────────┤
│                                        │
│  Är du säker på att du vill radera    │
│  denna produkt? Detta kan inte ångras. │
│                                        │
│             [AVBRYT]  [RADERA]         │
│                        (red)           │
└────────────────────────────────────────┘
```

---

## 7. Implementation Plan

### Phase 1: Foundation (Week 1)
**Priority:** Critical path items

1. **Currency Conversion**
   - Update all price displays (SEK, integer only)
   - Update price input validation
   - Test all price-related functionality

2. **Database Schema**
   - Create `product_images` table
   - Add `measurements` JSONB column to `article`
   - Run migrations

3. **Designer Removal**
   - Remove designer field from forms
   - Remove designer display from pages
   - Update TypeScript types

**Deliverables:**
- SEK currency throughout app
- Database ready for multiple images and measurements
- Designer field deprecated

---

### Phase 2: CRUD Completion (Week 2)
**Priority:** High - Core functionality

1. **Edit Product Page**
   - Create `/admin/products/[id]/edit` page
   - Implement ProductForm component (shared with add page)
   - Pre-populate form with existing data
   - Update API/Supabase query

2. **Delete Product Functionality**
   - Implement delete button on detail page
   - Create confirmation modal component
   - Implement delete API endpoint
   - Handle Cloudinary image deletion

3. **Testing**
   - Test edit workflow end-to-end
   - Test delete with confirmation
   - Test error handling

**Deliverables:**
- Full CRUD operations for products
- Reusable ProductForm component
- Confirmation modal component

---

### Phase 3: Multiple Images (Week 3)
**Priority:** High - User experience enhancement

1. **Backend**
   - Migrate existing `img_url` to `product_images` table
   - Implement multi-image upload API
   - Implement image reordering API
   - Implement individual image deletion API

2. **Frontend Components**
   - Create ImageUploadMultiple component
   - Create ImageGallery component
   - Integrate with PhotoCapture component

3. **Integration**
   - Update add product form
   - Update edit product form
   - Update product detail page

**Deliverables:**
- Support for 1-8 images per product
- Image gallery on product detail page
- Image management in forms

---

### Phase 4: Measurements System (Week 4)
**Priority:** High - Core feature for clothing

1. **Backend**
   - Define measurement schemas for each category
   - Implement measurement validation

2. **Frontend Components**
   - Create MeasurementFields component
   - Dynamic field rendering based on category
   - Swedish labels and cm units

3. **Integration**
   - Add to product forms
   - Display on product detail page
   - Update TypeScript types

**Deliverables:**
- Measurement input fields for all clothing types
- Measurement display on product pages
- Category-specific measurement fields

---

### Phase 5: Tag Management (Week 5)
**Priority:** Medium - Admin convenience

1. **Backend**
   - Create `POST /api/tags` endpoint
   - Implement tag name validation
   - Auto-generate slug

2. **Frontend**
   - Create TagSelect component
   - Implement "Create new tag" modal
   - Auto-select newly created tag

3. **Testing**
   - Test tag creation flow
   - Test duplicate tag prevention
   - Test tag selection

**Deliverables:**
- Dynamic tag creation from product form
- TagSelect component with create modal
- Tag validation

---

### Phase 6: Sale/Rent Enhancement (Week 6)
**Priority:** Medium - Business logic

1. **Backend**
   - No schema changes needed (use existing `for_sale` boolean)
   - Update product queries to handle rental items

2. **Frontend**
   - Replace checkbox with radio buttons
   - Update labeling: "Till salu" / "Uthyrning"
   - Add visual indicators for rental items

3. **Documentation**
   - Document future rental feature architecture
   - Design rental pricing tables (not implemented yet)

**Deliverables:**
- Clear sale vs. rent toggle
- Visual distinction for rental items
- Architectural documentation for future rental feature

---

### Phase 7: Polish & Testing (Week 7)
**Priority:** Quality assurance

1. **Responsive Design**
   - Test all forms on mobile
   - Test image galleries on mobile
   - Adjust layouts for tablets

2. **Error Handling**
   - Improve error messages (Swedish)
   - Handle network failures gracefully
   - Form validation feedback

3. **Performance**
   - Optimize image loading
   - Lazy load product images
   - Test with 100+ products

**Deliverables:**
- Fully responsive admin interface
- Comprehensive error handling
- Performance optimizations

---

## 8. Testing Strategy

### 8.1 Unit Tests

**Components:**
- MeasurementFields renders correct fields per category
- TagSelect handles create flow
- ImageGallery navigation works correctly
- Price validation (integer only, SEK)

**Utilities:**
- Measurement validation functions
- Price formatting functions
- Slug generation for tags

---

### 8.2 Integration Tests

**CRUD Operations:**
- Create product with multiple images and measurements
- Edit product and update measurements
- Delete product removes all images from Cloudinary

**Image Workflow:**
- Upload multiple images
- Reorder images
- Delete individual images
- Primary image selection

**Tag Creation:**
- Create new tag from product form
- Tag appears in dropdown
- Duplicate tag prevention

---

### 8.3 End-to-End Tests

**Complete Workflows:**
1. Admin adds new jacket with 3 images and full measurements
2. Admin edits jacket to change price and add 4th image
3. Admin creates new tag "Vintage" and applies to jacket
4. Admin marks jacket as "For Rent"
5. Admin deletes jacket (with confirmation)

**User Scenarios:**
- Add 10 products with various categories
- Verify all measurements display correctly
- Test image gallery on different devices
- Test form validation and error states

---

### 8.4 Manual Testing Checklist

**Currency:**
- [ ] All prices show "kr" instead of "$"
- [ ] Price inputs only accept integers
- [ ] No decimal points or commas in prices

**CRUD:**
- [ ] Can create product successfully
- [ ] Can edit existing product
- [ ] Edit form pre-populated correctly
- [ ] Can delete product with confirmation
- [ ] Deletion removes all associated images

**Images:**
- [ ] Can upload multiple images (up to 8)
- [ ] Primary image marked correctly
- [ ] Can reorder images
- [ ] Can delete individual images
- [ ] Image gallery works on mobile

**Measurements:**
- [ ] Correct fields shown for each category
- [ ] Measurements save correctly
- [ ] Measurements display on detail page
- [ ] Validation prevents negative numbers

**Tags:**
- [ ] Can create new tag from form
- [ ] New tag appears in dropdown
- [ ] Duplicate tags prevented
- [ ] Tag slugs generated correctly

**Sale/Rent:**
- [ ] Radio button toggle works
- [ ] Sale items display correctly
- [ ] Rent items visually distinct
- [ ] Data saves correctly to `for_sale` field

---

## 9. Success Metrics

### 9.1 Completion Criteria

**Phase 1-2:**
- [ ] All prices in SEK with integer-only inputs
- [ ] Designer field removed from UI
- [ ] Edit product page functional
- [ ] Delete product with confirmation functional
- [ ] Database migrations complete

**Phase 3-4:**
- [ ] Products can have 1-8 images
- [ ] Image gallery functional on detail page
- [ ] Measurements implemented for all clothing types
- [ ] Measurements display correctly

**Phase 5-6:**
- [ ] Dynamic tag creation functional
- [ ] Sale/Rent toggle working
- [ ] Rental items visually distinguished

**Phase 7:**
- [ ] Responsive design on all devices
- [ ] Error handling comprehensive
- [ ] All tests passing

---

### 9.2 Performance Targets

- Page load time: < 2 seconds
- Image upload: < 5 seconds per image
- Form submission: < 3 seconds
- Product list with 100+ items: < 3 seconds

---

### 9.3 Quality Targets

- Zero critical bugs at launch
- 90%+ test coverage for new features
- All forms accessible (keyboard navigation)
- Mobile responsive on iOS and Android

---

## 10. Risks & Mitigation

### 10.1 Technical Risks

**Risk:** Cloudinary image deletion may fail when deleting products
- **Mitigation:** Implement retry logic, log failures, manual cleanup tool

**Risk:** Multiple image uploads may be slow on poor connections
- **Mitigation:** Add progress indicators, allow saving draft with placeholder images

**Risk:** JSONB measurements column may complicate queries
- **Mitigation:** Add indexes, consider separate table if performance issues arise

---

### 10.2 User Experience Risks

**Risk:** Dynamic measurement fields may confuse users
- **Mitigation:** Add visual guide, tooltips, example values

**Risk:** Too many form fields may overwhelm admins
- **Mitigation:** Use collapsible sections, clear visual hierarchy

---

### 10.3 Business Risks

**Risk:** Rental feature requirements may change significantly
- **Mitigation:** Keep `for_sale` boolean simple, document future architecture

**Risk:** Context7.com integration requirements unclear
- **Mitigation:** Defer to Phase 8, gather requirements before implementation

---

## 11. Future Enhancements

### 11.1 Phase 8+: Not in Current Scope

**Rental Feature Full Implementation:**
- Rental pricing (daily/weekly/monthly rates)
- Booking calendar
- Deposit management
- Return workflow

**Context7.com Integration:**
- Awaiting requirements clarification

**Advanced Image Features:**
- AI-powered background removal
- Automatic image optimization
- 360° product views

**Search & Filtering:**
- Full-text search for products
- Filter by measurements
- Advanced admin search

**Bulk Operations:**
- Bulk edit products
- Bulk delete
- Import/export CSV

**Analytics:**
- Product view tracking
- Popular items dashboard
- Sales/rental reporting

---

## 12. Glossary

| Term | Definition |
|------|------------|
| **SEK** | Swedish Krona, currency code for Swedish currency |
| **CRUD** | Create, Read, Update, Delete - basic database operations |
| **Cloudinary** | Cloud-based image and video management service |
| **JSONB** | PostgreSQL's binary JSON column type |
| **Primary Image** | Main image displayed in product listings |
| **Slug** | URL-friendly version of a name (e.g., "y2k" from "Y2K") |
| **Uthyrning** | Swedish for "rental" or "rent" |
| **Till salu** | Swedish for "for sale" |

---

## 13. Appendix

### 13.1 Swedish Terminology Reference

| English | Swedish |
|---------|---------|
| For Sale | Till salu |
| For Rent | Uthyrning |
| Create | Skapa |
| Edit | Redigera |
| Delete | Radera |
| Cancel | Avbryt |
| Save | Spara |
| Product | Produkt |
| Category | Kategori |
| Size | Storlek |
| Tag | Tagg |
| Measurements | Mått |
| In Stock | I lager |
| Price | Pris |

---

### 13.2 Measurement Terms (Swedish)

| English | Swedish |
|---------|---------|
| Shoulder width | Axel till axel |
| Chest width | Bröstbredd / Armhåla till armhåla |
| Sleeve length | Ärmlängd |
| Garment length | Plagglängd |
| Waist width | Midjebredd |
| Hip width | Höftbredd |
| Inseam | Innerbenslängd |
| Outseam | Ytterbenslängd |
| Rise | Grenhöjd |
| Leg opening | Benslut / Vidd nertill |
| Slit | Slits |

---

### 13.3 Category Mapping

| Category Type | Swedish | English |
|---------------|---------|---------|
| Tops | Jacka, Tröja, Topp, Blus, Skjorta | Jacket, Sweater, Top, Blouse, Shirt |
| Bottoms | Byxor | Pants/Trousers |
| Dresses | Klänning | Dress |
| Skirts | Kjol | Skirt |

---

## 14. Document Control

**Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-10 | Product Team | Initial PRD |

**Approval:**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | TBD | | |
| Tech Lead | TBD | | |
| Designer | TBD | | |

**Distribution:**
- Development Team
- Product Management
- QA Team
- Stakeholders

---

**END OF DOCUMENT**
