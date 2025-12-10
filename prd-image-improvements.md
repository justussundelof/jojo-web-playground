# Product Requirements Document (PRD)
## JOJO CMS - Image Management Improvements

**Version:** 1.0
**Date:** 2025-12-10
**Project:** JOJO Web Playground - Image Upload & Management Enhancements
**Document Owner:** Product Team
**Priority:** High

---

## 1. Executive Summary

This PRD addresses critical improvements to the JOJO CMS image management system, focusing on:
1. Adding device file upload capability alongside camera capture
2. Fixing image display on the edit product page
3. Supporting Apple HEIC/HEIF image format
4. Implementing drag-and-drop image reordering

---

## 2. Current State Analysis

### 2.1 Existing Implementation

**Image Upload System:**
- **Component:** `PhotoCapture.tsx` (camera-only capture)
- **Method:** Browser MediaStream API (camera access)
- **Format:** JPEG only (95% quality)
- **Storage:** Cloudinary (`jojo-shop/products/` folder)
- **Database:** Single `img_url` field per product (TEXT)
- **Naming:** `JOJO{4-digit-counter}-{timestamp}.jpg`

**Current Buttons:**
- "TAKE PHOTO" - Start camera
- "CAPTURE" - Take photo from camera
- "RETAKE PHOTO" - Retake photo
- "SWITCH" - Toggle front/back camera

**Limitations:**
1. ❌ No file upload option (camera only)
2. ❌ Edit page not implemented yet
3. ❌ Only JPEG format supported
4. ❌ Single image per product (no multiple images)
5. ❌ No drag-and-drop reordering capability

---

## 3. Requirements

### 3.1 Add Device File Upload Option

**Priority:** High
**Effort:** Medium
**Dependencies:** None

#### 3.1.1 Functional Requirements

**FR-UPLOAD-001:** Add file upload button alongside camera capture

**User Story:**
> As an admin, I want to upload photos from my device so that I don't have to use the camera for every product photo.

**Requirements:**
- Add new "UPLOAD" button next to "TAKE PHOTO" button
- Button text: **"UPLOAD"** only (not "UPLOAD FROM DEVICE")
- Opens native file picker dialog
- Supports same image formats as camera (JPEG + see 3.3 for HEIC)
- Maintains existing photo counter (JOJO####) system
- Preview uploaded image before form submission
- Allow retake/re-upload

**UI Layout:**
```
Current:
┌──────────────────────┐
│   TAKE PHOTO         │
└──────────────────────┘

New:
┌────────────┬─────────────┐
│ TAKE PHOTO │   UPLOAD    │
└────────────┴─────────────┘
```

---

#### 3.1.2 Technical Implementation

**File Path:** `/components/PhotoCapture.tsx`

**Changes Required:**

1. **Add File Input Element:**
```typescript
<input
  type="file"
  accept="image/jpeg,image/jpg,image/png,image/heic,image/heif"
  onChange={handleFileUpload}
  ref={fileInputRef}
  style={{ display: 'none' }}
/>
```

2. **Add Upload Button:**
```typescript
<button
  type="button"
  onClick={() => fileInputRef.current?.click()}
  className="flex-1 py-3 bg-white border border-black hover:bg-black hover:text-white transition-colors"
>
  UPLOAD
</button>
```

3. **Handle File Upload:**
```typescript
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    setError('File size must be less than 10MB')
    return
  }

  // Convert HEIC if needed (see 3.3)
  let processedFile = file
  if (file.type === 'image/heic' || file.type === 'image/heif') {
    processedFile = await convertHeicToJpeg(file)
  }

  // Generate JOJO filename
  const photoIndex = getNextPhotoIndex()
  const indexString = photoIndex.toString().padStart(4, '0')
  const renamedFile = new File(
    [processedFile],
    `JOJO${indexString}-${Date.now()}.jpg`,
    { type: 'image/jpeg' }
  )

  // Preview
  const reader = new FileReader()
  reader.onload = (e) => {
    setCapturedImage(e.target?.result as string)
  }
  reader.readAsDataURL(renamedFile)

  // Pass to parent
  onPhotoCapture(renamedFile)
}
```

---

#### 3.1.3 Validation Rules

- **Max file size:** 10MB
- **Accepted formats:** JPEG, JPG, PNG, HEIC, HEIF
- **Min dimensions:** 300x300px
- **Max dimensions:** 5000x5000px
- **Error messages:**
  - "File size must be less than 10MB"
  - "Invalid file format. Please upload JPEG, PNG, or HEIC images"
  - "Image dimensions too small. Minimum 300x300px required"

---

### 3.2 Fix Edit Page Image Display

**Priority:** High
**Effort:** High
**Dependencies:** Edit page must be implemented first

#### 3.2.1 Current Problem

**Status:** Edit page does not exist yet

**File Status:**
- ❌ `/app/admin/products/[id]/edit/page.tsx` - **NOT IMPLEMENTED**
- ✅ `/app/admin/products/[id]/page.tsx` - View-only detail page exists
- ✅ `/app/admin/products/add/page.tsx` - Add page exists

**Issue Description:**
The user reports that images are not visible on the edit page. However, the edit page itself has not been implemented yet. The product detail page (view-only) has a non-functional "Edit Product" button.

---

#### 3.2.2 Functional Requirements

**FR-EDIT-001:** Create edit product page with image display and management

**Prerequisites:**
1. Implement edit product page (`/admin/products/[id]/edit`)
2. Fetch existing product data including image URL
3. Display current product image(s)
4. Allow image replacement
5. Allow image deletion

**User Story:**
> As an admin, when I edit a product, I want to see the current images so that I can decide whether to keep, replace, or delete them.

---

#### 3.2.3 Implementation Plan

**Step 1: Create Edit Page Route**

**File:** `/app/admin/products/[id]/edit/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import PhotoCapture from '@/components/PhotoCapture'
import type { Article, Category, Size, Tag } from '@/types/database'

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('article')
        .select(`
          *,
          category:categories(id, name),
          size:sizes(id, name),
          tag:tags(id, name)
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error

      setProduct(data)
      setCurrentImage(data.img_url) // Display existing image
      setLoading(false)
    } catch (error) {
      console.error('Error fetching product:', error)
      setLoading(false)
    }
  }

  // ... rest of component
}
```

---

**Step 2: Display Current Image in PhotoCapture**

**Update:** `/components/PhotoCapture.tsx`

Add support for displaying existing image URL:

```typescript
interface PhotoCaptureProps {
  onPhotoCapture: (file: File) => void
  currentImage?: string  // Add this prop
  existingImageUrl?: string  // NEW: Show existing image from database
}

export default function PhotoCapture({
  onPhotoCapture,
  currentImage,
  existingImageUrl  // NEW
}: PhotoCaptureProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [keepExistingImage, setKeepExistingImage] = useState(true)

  useEffect(() => {
    // Show existing image on mount if available
    if (existingImageUrl && !capturedImage) {
      setCapturedImage(existingImageUrl)
    }
  }, [existingImageUrl])

  return (
    <div>
      {/* Show existing image */}
      {existingImageUrl && keepExistingImage && !capturedImage && (
        <div className="space-y-4">
          <div className="relative w-full aspect-[3/4] bg-gray-100">
            <img
              src={existingImageUrl}
              alt="Current product"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setKeepExistingImage(false)}
              className="flex-1 py-3 border border-black"
            >
              REPLACE IMAGE
            </button>
          </div>
        </div>
      )}

      {/* Camera/Upload options (shown when replacing) */}
      {(!existingImageUrl || !keepExistingImage) && (
        // ... existing camera/upload UI
      )}
    </div>
  )
}
```

---

**Step 3: Handle Image Update on Save**

**In Edit Page:**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  let imageUrl = product?.img_url // Keep existing by default

  // If new image uploaded, upload to Cloudinary
  if (photoFile) {
    const uploadedUrl = await uploadImage(photoFile)
    if (uploadedUrl) {
      imageUrl = uploadedUrl
      // Optional: Delete old image from Cloudinary
      if (product?.img_url) {
        await deleteOldImage(product.img_url)
      }
    }
  }

  // Update product
  const { error } = await supabase
    .from('article')
    .update({
      title: formData.title,
      description: formData.description,
      price: formData.price,
      img_url: imageUrl,
      // ... other fields
    })
    .eq('id', params.id)

  if (!error) {
    router.push(`/admin/products/${params.id}`)
  }
}
```

---

#### 3.2.4 Edge Cases

**Case 1: Product has no image**
- Show empty state with upload/camera options
- No "Keep existing image" option

**Case 2: Image URL is broken/invalid**
- Show placeholder image
- Display error message: "Current image unavailable"
- Force upload of new image

**Case 3: User starts replacing but cancels**
- "Keep Existing Image" button to revert
- Confirmation: "Discard new image?"

---

### 3.3 Support HEIC/HEIF Format

**Priority:** Medium
**Effort:** Medium
**Dependencies:** None

#### 3.3.1 Problem Statement

**HEIC (High Efficiency Image Container):**
- Default format for photos on iPhone/iPad (iOS 11+)
- 50% smaller file size than JPEG
- Better quality at lower file sizes
- Not natively supported by all browsers

**Current Issue:**
- Users cannot upload HEIC photos from iPhone
- Must convert manually before upload
- Poor user experience for iOS users

---

#### 3.3.2 Functional Requirements

**FR-HEIC-001:** Accept and convert HEIC/HEIF images

**User Story:**
> As an admin using an iPhone, I want to upload photos directly from my camera roll without converting them first.

**Requirements:**
- Accept HEIC/HEIF files in file picker
- Automatically convert to JPEG on client side
- Show loading indicator during conversion
- Maintain photo quality (95% JPEG quality)
- Keep original filename pattern (JOJO####)
- Handle conversion errors gracefully

---

#### 3.3.3 Technical Implementation

**Approach: Client-Side Conversion with heic2any Library**

**Install Dependency:**
```bash
npm install heic2any
```

**Package:** `heic2any` - Converts HEIC to JPEG/PNG in browser
- Zero backend dependencies
- Works in all modern browsers
- MIT licensed

---

**Implementation in PhotoCapture.tsx:**

```typescript
import heic2any from 'heic2any'

const convertHeicToJpeg = async (file: File): Promise<File> => {
  try {
    // Check if HEIC
    const isHeic = file.type === 'image/heic' ||
                   file.type === 'image/heif' ||
                   file.name.toLowerCase().endsWith('.heic') ||
                   file.name.toLowerCase().endsWith('.heif')

    if (!isHeic) return file

    setError(null)
    // Show loading state
    setIsConverting(true)

    // Convert HEIC to JPEG
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.95,
    }) as Blob

    // Create new File object
    const convertedFile = new File(
      [convertedBlob],
      file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'),
      { type: 'image/jpeg' }
    )

    setIsConverting(false)
    return convertedFile

  } catch (error) {
    console.error('HEIC conversion failed:', error)
    setIsConverting(false)
    setError('Failed to convert HEIC image. Please try a different file.')
    throw error
  }
}

const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    // Convert if HEIC
    const processedFile = await convertHeicToJpeg(file)

    // Generate JOJO filename
    const photoIndex = getNextPhotoIndex()
    const indexString = photoIndex.toString().padStart(4, '0')
    const renamedFile = new File(
      [processedFile],
      `JOJO${indexString}-${Date.now()}.jpg`,
      { type: 'image/jpeg' }
    )

    // Continue with upload...
    onPhotoCapture(renamedFile)

  } catch (error) {
    // Error already handled in convertHeicToJpeg
  }
}
```

---

#### 3.3.4 UI/UX Considerations

**Loading State:**
```typescript
{isConverting && (
  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-4 rounded">
      <p className="text-sm">Converting HEIC image...</p>
      <div className="mt-2 h-1 bg-gray-200 rounded">
        <div className="h-full bg-black rounded animate-pulse" style={{ width: '100%' }} />
      </div>
    </div>
  </div>
)}
```

**File Input Accept Attribute:**
```typescript
<input
  type="file"
  accept="image/jpeg,image/jpg,image/png,image/heic,image/heif"
  // ...
/>
```

**Error Messages:**
- "Converting HEIC image..." (during conversion)
- "Failed to convert HEIC image. Please try a different file." (on error)
- "HEIC conversion successful" (success notification, optional)

---

#### 3.3.5 Browser Compatibility

**heic2any Library Support:**
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Fallback:** If conversion fails, show error and request JPEG/PNG

---

### 3.4 Implement Drag-and-Drop Image Reordering

**Priority:** High
**Effort:** High
**Dependencies:** Multiple images feature must be implemented first

#### 3.4.1 Current State

**Issue:** Only single image per product is supported

**Current Schema:**
```sql
CREATE TABLE article (
  id BIGSERIAL PRIMARY KEY,
  img_url TEXT,  -- Single image only
  -- ...
)
```

**Requirement:** To support reordering, we need multiple images per product

---

#### 3.4.2 Functional Requirements

**FR-DRAG-001:** Enable drag-and-drop reordering of product images

**Prerequisites:**
1. Implement `product_images` table (from main PRD)
2. Support uploading multiple images (1-8 per product)
3. Store `display_order` for each image

**User Story:**
> As an admin, I want to drag images to reorder them so that I can control which image appears first in the gallery.

---

#### 3.4.3 Database Schema (Prerequisite)

**Create product_images table:**

```sql
CREATE TABLE product_images (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES article(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique index: Only one primary image per product
CREATE UNIQUE INDEX idx_one_primary_per_product
ON product_images (article_id)
WHERE is_primary = TRUE;

-- Index for faster queries
CREATE INDEX idx_product_images_article
ON product_images(article_id);

-- Index for ordering
CREATE INDEX idx_product_images_order
ON product_images(article_id, display_order);
```

---

#### 3.4.4 Technical Implementation

**Library:** `@dnd-kit/core` + `@dnd-kit/sortable`

**Install:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Why @dnd-kit:**
- Modern, performant, accessible
- Works with React 19
- Touch support (mobile)
- Small bundle size
- Active maintenance

---

**Create ImageReorder Component:**

**File:** `/components/ImageReorder.tsx`

```typescript
'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ProductImage {
  id: number
  image_url: string
  display_order: number
  is_primary: boolean
}

interface ImageReorderProps {
  images: ProductImage[]
  onReorder: (images: ProductImage[]) => void
  onDelete: (imageId: number) => void
  onSetPrimary: (imageId: number) => void
}

function SortableImage({
  image,
  onDelete,
  onSetPrimary
}: {
  image: ProductImage
  onDelete: () => void
  onSetPrimary: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 bg-white p-2 rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
        </svg>
      </div>

      {/* Image */}
      <img
        src={image.image_url}
        alt=""
        className="w-full aspect-[3/4] object-cover border border-black"
      />

      {/* Primary badge */}
      {image.is_primary && (
        <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 text-xs">
          PRIMARY
        </div>
      )}

      {/* Action buttons (visible on hover) */}
      <div className="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {!image.is_primary && (
          <button
            type="button"
            onClick={onSetPrimary}
            className="flex-1 py-1 bg-white border border-black text-xs hover:bg-black hover:text-white"
          >
            SET PRIMARY
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="flex-1 py-1 bg-red-500 text-white text-xs hover:bg-red-600"
        >
          DELETE
        </button>
      </div>
    </div>
  )
}

export default function ImageReorder({
  images,
  onReorder,
  onDelete,
  onSetPrimary,
}: ImageReorderProps) {
  const [items, setItems] = useState(images)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const newItems = arrayMove(items, oldIndex, newIndex)

        // Update display_order
        const reorderedItems = newItems.map((item, index) => ({
          ...item,
          display_order: index,
        }))

        // Notify parent
        onReorder(reorderedItems)

        return reorderedItems
      })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((image) => (
            <SortableImage
              key={image.id}
              image={image}
              onDelete={() => onDelete(image.id)}
              onSetPrimary={() => onSetPrimary(image.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
```

---

**Integration in Edit Page:**

```typescript
import ImageReorder from '@/components/ImageReorder'

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [images, setImages] = useState<ProductImage[]>([])

  const handleReorder = async (reorderedImages: ProductImage[]) => {
    // Update display_order in database
    for (const image of reorderedImages) {
      await supabase
        .from('product_images')
        .update({ display_order: image.display_order })
        .eq('id', image.id)
    }

    setImages(reorderedImages)
  }

  const handleDeleteImage = async (imageId: number) => {
    // Confirm deletion
    if (!confirm('Delete this image?')) return

    // Delete from database
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId)

    if (!error) {
      setImages((prev) => prev.filter((img) => img.id !== imageId))

      // Optional: Delete from Cloudinary
      // await deleteFromCloudinary(imageUrl)
    }
  }

  const handleSetPrimary = async (imageId: number) => {
    // Unset all primary flags
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('article_id', params.id)

    // Set new primary
    await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId)

    // Update local state
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        is_primary: img.id === imageId,
      }))
    )
  }

  return (
    <div>
      <h2 className="text-xl mb-4">PRODUCT IMAGES</h2>
      <ImageReorder
        images={images}
        onReorder={handleReorder}
        onDelete={handleDeleteImage}
        onSetPrimary={handleSetPrimary}
      />
    </div>
  )
}
```

---

#### 3.4.5 User Experience

**Visual Feedback:**
- Drag cursor changes to move icon
- Image opacity reduces while dragging (50%)
- Smooth animation when dropping
- "PRIMARY" badge on main image
- Hover state shows action buttons

**Touch Support:**
- Long press to initiate drag (mobile)
- Touch-friendly button sizes
- Haptic feedback (if supported)

**Keyboard Support:**
- Tab to focus image
- Space/Enter to pick up
- Arrow keys to move
- Space/Enter to drop
- Escape to cancel

---

#### 3.4.6 API Endpoints

**Update Display Order:**
```typescript
// PUT /api/products/[id]/images/reorder
// Body: { images: [{ id: 1, display_order: 0 }, { id: 2, display_order: 1 }] }

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { images } = await request.json()

  // Update each image's display_order
  for (const img of images) {
    await supabase
      .from('product_images')
      .update({ display_order: img.display_order })
      .eq('id', img.id)
  }

  return Response.json({ success: true })
}
```

---

## 4. Implementation Phases

### Phase 1: File Upload Button (Week 1)
**Priority:** High

**Tasks:**
1. Add "UPLOAD" button to PhotoCapture component
2. Implement file input handler
3. Add file validation
4. Test with JPEG/PNG files
5. Maintain JOJO#### naming system

**Deliverables:**
- ✅ Upload button functional
- ✅ File validation working
- ✅ Preview before submission

---

### Phase 2: HEIC Format Support (Week 1-2)
**Priority:** Medium

**Tasks:**
1. Install `heic2any` library
2. Implement HEIC to JPEG conversion
3. Add loading state during conversion
4. Add error handling
5. Test with iPhone HEIC photos

**Deliverables:**
- ✅ HEIC files accepted in file picker
- ✅ Automatic conversion to JPEG
- ✅ Loading indicator shown
- ✅ Error handling for failed conversions

---

### Phase 3: Edit Page Implementation (Week 2-3)
**Priority:** High

**Prerequisites:**
- Multiple images feature must be built first (from main PRD)
- `product_images` table created

**Tasks:**
1. Create `/admin/products/[id]/edit/page.tsx`
2. Fetch product data including images
3. Display current images
4. Allow image replacement
5. Update PhotoCapture to show existing images
6. Implement save/update logic

**Deliverables:**
- ✅ Edit page route functional
- ✅ Current images displayed
- ✅ Can replace images
- ✅ Can keep existing images
- ✅ Save updates to database

---

### Phase 4: Drag-and-Drop Reordering (Week 3-4)
**Priority:** High

**Prerequisites:**
- Edit page implemented
- Multiple images feature implemented
- `product_images` table created

**Tasks:**
1. Install `@dnd-kit` libraries
2. Create ImageReorder component
3. Implement drag-and-drop functionality
4. Add visual feedback
5. Update database on reorder
6. Test keyboard and touch support

**Deliverables:**
- ✅ Drag-and-drop working
- ✅ Display order persists
- ✅ Touch support (mobile)
- ✅ Keyboard navigation
- ✅ Set primary image feature

---

## 5. Testing Plan

### 5.1 Upload Button Testing

**Test Cases:**
1. Click "UPLOAD" button opens file picker
2. Select JPEG file uploads successfully
3. Select PNG file uploads successfully
4. Select HEIC file uploads successfully (after conversion)
5. File over 10MB shows error
6. Invalid file format shows error
7. Preview shown before form submission
8. JOJO#### counter increments correctly

---

### 5.2 HEIC Conversion Testing

**Test Cases:**
1. Upload HEIC from iPhone - converts to JPEG
2. Loading indicator shown during conversion
3. Conversion completes within 3 seconds (typical)
4. Error message if conversion fails
5. Converted file maintains quality
6. Filename changed from .heic to .jpg
7. Works on desktop and mobile browsers

---

### 5.3 Edit Page Image Display Testing

**Test Cases:**
1. Edit page loads with current images
2. Images displayed in correct order
3. Primary image marked correctly
4. "REPLACE IMAGE" button works
5. New image replaces old image
6. "Keep existing image" option works
7. Save persists image changes
8. Old image deleted from Cloudinary (optional)

---

### 5.4 Drag-and-Drop Testing

**Test Cases:**
1. Can drag images to reorder
2. Display order persists after save
3. Primary image can be changed
4. Delete image works with confirmation
5. Touch drag works on mobile
6. Keyboard navigation works
7. Drag animation smooth
8. Database display_order updated correctly

---

## 6. Success Metrics

### 6.1 Completion Criteria

**Phase 1-2:**
- [ ] "UPLOAD" button functional
- [ ] HEIC files automatically converted
- [ ] File validation working
- [ ] JOJO#### naming maintained

**Phase 3:**
- [ ] Edit page displays current images
- [ ] Can replace images on edit
- [ ] Can keep existing images
- [ ] Save updates work correctly

**Phase 4:**
- [ ] Drag-and-drop reordering works
- [ ] Display order persists in database
- [ ] Touch and keyboard support
- [ ] Set primary image feature works

---

### 6.2 Performance Targets

- File upload: < 5 seconds per image
- HEIC conversion: < 3 seconds per image
- Drag-and-drop response: < 100ms
- Edit page load: < 2 seconds

---

### 6.3 Quality Targets

- Zero critical bugs at launch
- 95%+ successful HEIC conversions
- Works on iOS Safari, Chrome, Firefox
- Mobile responsive

---

## 7. Known Issues & Limitations

### 7.1 HEIC Conversion Limitations

**Browser Limitations:**
- Conversion happens in browser (CPU intensive)
- Large HEIC files (>10MB) may be slow
- Some very old browsers may not support heic2any

**Mitigation:**
- Show clear loading indicator
- Set reasonable file size limit (10MB)
- Provide fallback error message

---

### 7.2 Multiple Images Prerequisites

**Dependency Chain:**
```
Multiple Images Feature (from main PRD)
  ↓
product_images Table Created
  ↓
Edit Page Can Show Multiple Images
  ↓
Drag-and-Drop Can Reorder Images
```

**Note:** Features 3.2 (Edit Page Images) and 3.4 (Drag-Drop) **cannot be fully implemented** until the multiple images feature from the main PRD is completed.

---

## 8. Related Documents

- **Main PRD:** `/home/user/jojo-web-playground/prd.md` (comprehensive JOJO CMS enhancements)
- **Component:** `/home/user/jojo-web-playground/components/PhotoCapture.tsx`
- **Add Page:** `/home/user/jojo-web-playground/app/admin/products/add/page.tsx`
- **Detail Page:** `/home/user/jojo-web-playground/app/admin/products/[id]/page.tsx`

---

## 9. Glossary

| Term | Definition |
|------|------------|
| **HEIC** | High Efficiency Image Container - Apple's image format |
| **HEIF** | High Efficiency Image Format - HEIC variant |
| **heic2any** | JavaScript library for converting HEIC to JPEG/PNG |
| **@dnd-kit** | React drag-and-drop library |
| **Primary Image** | Main image displayed first in galleries |
| **Display Order** | Integer value determining image order (0, 1, 2...) |

---

## 10. Appendix

### 10.1 File Structure

```
/components
├── PhotoCapture.tsx (UPDATE)
│   ├── Add file upload button
│   ├── Add HEIC conversion
│   └── Add existing image display
└── ImageReorder.tsx (NEW)
    └── Drag-and-drop image reordering

/app/admin/products
├── add/page.tsx (NO CHANGE)
└── [id]
    ├── page.tsx (UPDATE - add Edit link)
    └── edit/page.tsx (NEW)

/types
└── database.ts (UPDATE)
    └── Add ProductImage interface

/utils
└── imageConverter.ts (NEW - optional)
    └── HEIC conversion utilities
```

---

### 10.2 Dependencies to Add

```json
{
  "dependencies": {
    "heic2any": "^0.0.4",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2"
  }
}
```

---

## 11. Document Control

**Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-10 | Product Team | Initial PRD for image improvements |

---

**END OF DOCUMENT**
