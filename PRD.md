# PRD: Demo-Ready Fixes

> **Purpose:** Make the website look polished and functional for a photo demo (screenshots)
> **Priority:** Visual appearance and apparent functionality over deep backend fixes
> **Timeline:** ASAP - Demo screenshots needed

---

## Overview

This PRD covers urgent fixes to make the JOJO web app demo-ready. The goal is **not** full functionality, but making the app **look complete** when capturing screenshots for the demo.

---

## 1. ADMIN CMS PAGE (Critical Priority)

### 1.1 Make Admin Dashboard Visible

**Problem:** The `AdminDashboard` component is commented out in the main admin page. Users see only a product grid with no obvious way to add products.

**File:** `app/admin/page.tsx` (lines 36-43)

**Fix:** Uncomment or restructure to show:
- "Add Product" button clearly visible
- Content editing buttons (About, Newsletter, etc.)
- Clear visual indication this is an admin interface

**Demo Impact:** Without this, screenshots won't show how admins manage content.

---

### 1.2 Fix Product Modal - Hardcoded Description

**Problem:** Every product in the admin modal shows the same placeholder text:
> "Cropped, loose fitting, parka featuring seven pockets and multi-function hood design. OTTO 958 rubber injected velcro patch..."

**File:** `components/product-page/ProductModalClient.tsx`
- Lines 148-153 (mobile view)
- Lines 207-213 (desktop view)

**Fix:** Replace hardcoded text with `{product.description}`

**Demo Impact:** Products look fake/broken if they all show the same description.

---

### 1.3 Fix Product Modal - Duplicate Images

**Problem:** The admin modal shows the same image repeated 4 times instead of actual product gallery images.

**File:** `components/product-page/ProductModalClient.tsx` (line 55)
```javascript
const images = Array(4).fill(product.img_url); // BAD - just repeats
```

**Fix:** Fetch images from `product_images` table like the regular product page does (`app/products/[id]/page.tsx`)

**Demo Impact:** Image gallery looks broken and unprofessional.

---

### 1.4 Fix Admin Routing Inconsistencies

**Problem:** Different parts of the app use different URL patterns, causing navigation to fail.

| Location | Current Route | Should Be |
|----------|--------------|-----------|
| AdminProductGrid (line 118) | `/admin/product/${id}` | Keep as-is (singular) |
| ProductForm Edit (line 450) | `/admin/products/${id}` | `/admin/product/${id}` |
| ProductActions View (line 54) | `/admin/products/${id}` | `/admin/product/${id}` |
| ProductActions Delete (line 40) | `/admin/products` | `/admin` |

**Fix:** Standardize all routes to `/admin/product/[id]` (singular, matches existing modal route)

**Demo Impact:** Clicking buttons leads to 404 errors - very bad for demo credibility.

---

## 2. VISUAL POLISH (High Priority)

### 2.1 Fix Broken CSS Classes

**Problem:** Invalid Tailwind classes causing styling issues.

**File:** `components/product-page/ProductCard.tsx`
- Line 95: `h-p` (invalid) → change to `h-full` or appropriate value
- Line 134: `pr-` (incomplete) → change to `pr-2` or appropriate value

**Demo Impact:** Broken layouts in product cards.

---

### 2.2 Remove/Hide Deprecated Designer Field

**Problem:** The modal displays `product.designer` which is deprecated. Many products show empty values.

**File:** `components/product-page/ProductModalClient.tsx` (lines 158, 218)

**Fix:** Either:
- Remove the designer line entirely, OR
- Conditionally render: `{product.designer && <span>by {product.designer}</span>}`

**Demo Impact:** Empty "by" labels look unfinished.

---

### 2.3 "NO IMAGE" Placeholder Styling

**Problem:** Products without images show raw "NO IMAGE" text.

**Files:**
- `components/product-page/ProductCard.tsx` (line 88)
- `components/product-page/ProductInlinePanel.tsx`

**Fix:** Style the placeholder to look intentional:
- Add a placeholder icon
- Use muted colors
- Or ensure all demo products have images

**Demo Impact:** Raw text placeholders look like developer notes.

---

## 3. ADMIN UX IMPROVEMENTS (Medium Priority)

### 3.1 Clear Admin Interface Indicators

**Current State:** The admin page looks too similar to the public site.

**Suggestions for demo:**
- Add an "ADMIN" badge/header
- Use a subtle different background color
- Make action buttons more prominent

---

### 3.2 Product Grid Actions

**Problem:** `AdminProductGrid` has dead/confusing handlers:
- `openModal()` navigates to public product page, not admin edit
- Toggle active state handlers exist but aren't properly connected

**File:** `components/AdminProductGrid.tsx`

**Fix:** Ensure clicking a product in admin opens the admin edit modal, not the public view.

---

## 4. QUICK WINS CHECKLIST

For the fastest demo-ready state, prioritize in this order:

- [ ] **1. Uncomment AdminDashboard** - Show the control panel
- [ ] **2. Fix hardcoded description** - Use actual product.description
- [ ] **3. Fix routing** - Standardize to /admin/product/[id]
- [ ] **4. Fix broken CSS** - h-p and pr- classes
- [ ] **5. Fix modal images** - Fetch from product_images table
- [ ] **6. Hide empty designer field** - Conditional render

---

## Files to Modify

| File | Changes |
|------|---------|
| `app/admin/page.tsx` | Uncomment AdminDashboard |
| `components/product-page/ProductModalClient.tsx` | Fix description, images, designer |
| `components/product-page/ProductCard.tsx` | Fix CSS classes |
| `components/ProductForm.tsx` | Fix edit route redirect |
| `components/product-page/ProductActions.tsx` | Fix view and delete routes |
| `components/AdminProductGrid.tsx` | Fix modal navigation |

---

## Success Criteria

The demo is ready when:
1. Admin page clearly shows product management controls
2. Clicking any product shows correct description and images
3. All navigation works without 404 errors
4. No broken layouts or styling issues visible
5. No placeholder text or "developer notes" visible

---

## Out of Scope

These can wait until after the demo:
- Backend validation improvements
- Full image gallery upload
- Search functionality
- User authentication flows
- Performance optimization
- Mobile responsiveness edge cases
