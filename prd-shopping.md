# Product Requirements Document (PRD)
## JOJO Vintage Shop - Profile, Wishlist & Shopping Cart Features

**Version:** 1.0
**Date:** 2025-12-19
**Project:** JOJO Web Playground
**Document Owner:** Product Team
**Reference:** JW Anderson Profile Page Design

---

## 1. Executive Summary

This PRD outlines the requirements for implementing user profile functionality, product wishlist system, and a complete shopping cart with checkout flow for the JOJO Vintage Shop. These features will enable authenticated users to manage their account, save favorite products, and complete purchases through a streamlined checkout process.

---

## 2. Project Context

### 2.1 Current State
- **Tech Stack:** Next.js 16, React 19, TypeScript, Supabase, Tailwind CSS 4
- **Authentication:** Supabase Auth with `AuthContext` (role-based: admin/user)
- **Cart System:** `CartContext` exists with localStorage persistence
- **Modal System:** Full-screen overlays with Framer Motion animations
- **Menu Navigation:** "Admin" link visible in menu for all users
- **Wishlist:** Not implemented (only placeholder heart icon exists)
- **Profile Page:** Not implemented
- **Checkout:** Basic page exists with Stripe integration (needs enhancement)

### 2.2 Goals
1. Implement user profile page with account overview
2. Add wishlist functionality for saving favorite products
3. Create shopping cart modal/drawer with full functionality
4. Build checkout page for order review before payment
5. Display order history (with dummy data initially)
6. Update navigation to show "Profile" instead of "Admin" for regular users

### 2.3 Design Reference
- **JW Anderson Profile Page:** Used as UI/UX reference
- **Structure:** Two-column layout with profile sections

---

## 3. Requirements

### 3.1 Navigation Update - Profile vs Admin

**Priority:** High
**Effort:** Low

#### 3.1.1 Functional Requirements

**FR-NAV-001:** Dynamic menu item based on user role
- When user is signed in as **admin**: Menu shows "Admin" link → `/admin`
- When user is signed in as **regular user**: Menu shows "Profile" link → `/profile`
- When user is **not signed in**: Neither link is shown (or show "Sign In")

**Affected Files:**
- `/components/Navigation-header/MenuOverlay.tsx`
- `/components/Navigation-header/HeaderNav.tsx`

**Implementation:**
```typescript
// In MenuOverlay.tsx - conditional rendering
const { profile, isAuthenticated, isAdmin } = useAuth()

// In navigation items array
{isAuthenticated && (
  isAdmin
    ? { label: "Admin", href: "/admin" }
    : { label: "Profile", href: "/profile" }
)}
```

---

### 3.2 Profile Page

**Priority:** High
**Effort:** Medium

#### 3.2.1 Page Structure (Reference: JW Anderson)

**Route:** `/profile`
**Protection:** Requires authentication (redirect to login if not authenticated)

**Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│ HOME / PROFILE                                                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐ │
│  │ MY PROFILE                  │  │ ORDERS AND RETURNS          │ │
│  │                             │  │                             │ │
│  │ You are logged in as:       │  │ You have X orders to view.  │ │
│  │ user@email.com              │  │ Once an order is placed,    │ │
│  │                             │  │ you'll be able to check     │ │
│  │ Manage your personal        │  │ its status.                 │ │
│  │ information, update your    │  │                             │ │
│  │ password, or log out        │  │ [VIEW ORDERS AND RETURNS]   │ │
│  │                             │  │                             │ │
│  │ [GO TO MY PROFILE]          │  └─────────────────────────────┘ │
│  └─────────────────────────────┘                                   │
│                                                                     │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐ │
│  │ ADDRESS BOOK                │  │ WISHLIST                    │ │
│  │                             │  │                             │ │
│  │ You have X saved addresses. │  │ You have X saved items.     │ │
│  │ Add or edit details to keep │  │ Manage your favorite items. │ │
│  │ your information up-to-date.│  │                             │ │
│  │                             │  │ [MANAGE ITEMS]              │ │
│  │ [MANAGE ADDRESS BOOK]       │  │                             │ │
│  └─────────────────────────────┘  └─────────────────────────────┘ │
│                                                                     │
│  [LOG OUT]                                                          │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

#### 3.2.2 Profile Sections

**FR-PRO-001:** My Profile Section
- Display user email from `AuthContext`
- Description text about managing account
- "GO TO MY PROFILE" button → Opens profile edit modal or section
- Profile edit functionality (future enhancement - password change, etc.)

**FR-PRO-002:** Orders and Returns Section
- Display count of orders (from dummy data initially)
- Description about viewing order status
- "VIEW ORDERS AND RETURNS" button → Opens orders modal

**FR-PRO-003:** Address Book Section (Future Enhancement)
- Display count of saved addresses
- "MANAGE ADDRESS BOOK" button
- **Note:** Implement as placeholder/disabled for now

**FR-PRO-004:** Wishlist Section
- Display count of wishlisted items from `WishlistContext`
- Description about managing favorite items
- "MANAGE ITEMS" button → Opens wishlist modal

**FR-PRO-005:** Log Out Button
- Prominent logout button at bottom of page
- Calls `signOut()` from `AuthContext`
- Redirects to home page after logout

#### 3.2.3 Technical Implementation

**New Files:**
```
/app/profile/page.tsx          - Profile page component
/components/ProfileSection.tsx  - Reusable section card component
```

**Styling (Follow existing patterns):**
- Use existing `jojo-main-wrapper-top` class
- Two-column grid layout (similar to MenuOverlay)
- Font: `font-mono` for section titles, `font-serif-book` for text
- Borders: `border-2 border-black` or `border-primary`
- Background: `bg-background` or `bg-accent` for cards
- Buttons: Use existing `Button` component with `variant="link"`

---

### 3.3 Wishlist Feature

**Priority:** High
**Effort:** Medium

#### 3.3.1 Wishlist Context

**FR-WIS-001:** Create WishlistContext (follow CartContext pattern)

**File:** `/context/WishlistContext.tsx`

**Interface:**
```typescript
interface WishlistItem {
    id: string                    // Product ID as string
    productId: number             // Original product ID
    name: string
    price: number
    image: string
    addedAt: Date
}

interface WishlistContextType {
    items: WishlistItem[]
    addItem: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => void
    removeItem: (productId: number) => void
    clearWishlist: () => void
    isInWishlist: (productId: number) => boolean
    itemCount: number
}
```

**Storage:**
- LocalStorage key: `'product-wishlist'`
- Auto-save on every change
- Auto-load on component mount

#### 3.3.2 Wishlist Toggle Button

**FR-WIS-002:** Add wishlist toggle to product cards and modals

**Locations:**
- `/components/product-page/ProductCard.tsx` - Heart icon overlay
- `/components/product-page/ProductModalClient.tsx` - Heart icon (already exists, needs functionality)

**UI Behavior:**
- Empty heart icon: Product not in wishlist
- Filled heart icon: Product is in wishlist
- Click toggles state
- Optional: Brief animation on toggle

**Implementation:**
```typescript
const { isInWishlist, addItem, removeItem } = useWishlist()
const isWished = isInWishlist(product.id)

const toggleWishlist = () => {
  if (isWished) {
    removeItem(product.id)
  } else {
    addItem({
      productId: product.id,
      name: product.title,
      price: product.price,
      image: product.img_url
    })
  }
}
```

#### 3.3.3 Wishlist Modal

**FR-WIS-003:** Create wishlist modal (same style as login modal)

**File:** `/components/WishlistModal.tsx`

**Features:**
- Full-screen overlay (slides in from right like login modal)
- Lists all wishlisted products in cart-style layout
- Each item shows: Image, Title, Price
- Remove button (X or trash icon) per item
- "Add to Cart" button per item
- "Clear All" button
- Empty state: "Your wishlist is empty"
- Close button (same as login modal)

**Layout:**
```
┌────────────────────────────────────────────┐
│ Close [x]                                  │
├────────────────────────────────────────────┤
│                                            │
│ WISHLIST (X items)                         │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ [IMG]  Product Title                   │ │
│ │        299 kr                          │ │
│ │        [ADD TO CART] [REMOVE]          │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ [IMG]  Product Title 2                 │ │
│ │        450 kr                          │ │
│ │        [ADD TO CART] [REMOVE]          │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ [CLEAR ALL]                                │
│                                            │
└────────────────────────────────────────────┘
```

---

### 3.4 Shopping Cart Feature

**Priority:** High
**Effort:** Medium

#### 3.4.1 Cart Modal/Drawer

**FR-CAR-001:** Create cart modal (same style as other modals)

**File:** `/components/CartModal.tsx`

**Features:**
- Full-screen overlay (slides in from right)
- Lists all cart items
- Each item shows: Image, Title, Price, Quantity controls
- Quantity controls: - / number / +
- Remove button per item
- Subtotal display
- "Continue Shopping" button (closes modal)
- "Proceed to Checkout" button (navigates to `/checkout`)
- Empty state: "Your cart is empty"

**Layout:**
```
┌────────────────────────────────────────────┐
│ Close [x]                                  │
├────────────────────────────────────────────┤
│                                            │
│ SHOPPING CART (X items)                    │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ [IMG]  Product Title                   │ │
│ │        299 kr                          │ │
│ │        Qty: [-] 1 [+]     [REMOVE]     │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ [IMG]  Product Title 2                 │ │
│ │        450 kr                          │ │
│ │        Qty: [-] 2 [+]     [REMOVE]     │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ────────────────────────────────────────── │
│ Subtotal:                        1,199 kr  │
│ ────────────────────────────────────────── │
│                                            │
│ [CONTINUE SHOPPING]                        │
│ [PROCEED TO CHECKOUT]                      │
│                                            │
└────────────────────────────────────────────┘
```

#### 3.4.2 Cart Badge in Header

**FR-CAR-002:** Add cart count badge to header

**Location:** `/components/Navigation-header/HeaderNav.tsx`

**Implementation:**
- Show cart icon with item count badge
- Badge only visible when `itemCount > 0`
- Click opens cart modal

```typescript
const { itemCount } = useCart()

<button onClick={() => setCartOpen(true)} className="relative">
  <span>BAG</span>
  {itemCount > 0 && (
    <span className="absolute -top-1 -right-2 bg-primary text-primary-foreground
                     text-xs w-4 h-4 flex items-center justify-center">
      {itemCount}
    </span>
  )}
</button>
```

#### 3.4.3 Add to Cart Button

**FR-CAR-003:** Add "Add to Cart" functionality to product pages

**Locations:**
- `/components/product-page/ProductModalClient.tsx`
- `/components/product-page/ProductInlinePanel.tsx`

**UI:**
- "ADD TO CART" button (prominent, primary style)
- Optional: Size/variant selector (if applicable)
- Feedback: Brief confirmation when added

---

### 3.5 Checkout Page

**Priority:** High
**Effort:** Medium

#### 3.5.1 Checkout Flow

**Route:** `/checkout`
**Protection:** Requires authentication

**FR-CHE-001:** Order Review Page

**Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│ CHECKOUT                                                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ORDER SUMMARY                                                │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                              │   │
│  │ [IMG] Product Title                           1 × 299 kr    │   │
│  │ [IMG] Product Title 2                         2 × 450 kr    │   │
│  │                                                              │   │
│  │ ────────────────────────────────────────────────────────────│   │
│  │ Subtotal:                                        1,199 kr   │   │
│  │ Shipping:                                           49 kr   │   │
│  │ Tax (25% VAT):                                    312 kr   │   │
│  │ ────────────────────────────────────────────────────────────│   │
│  │ TOTAL:                                          1,560 kr   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ SHIPPING ADDRESS                                             │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ [Form fields for address - placeholder for now]              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ PAYMENT                                                      │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ [Stripe integration placeholder]                             │   │
│  │ Will implement Stripe + Shopify later                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [BACK TO CART]                    [PLACE ORDER (DEMO)]            │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

**FR-CHE-002:** Order Summary Section
- List all cart items with quantities and line totals
- Subtotal calculation (from CartContext)
- Shipping cost (fixed 49 kr for now, or free above certain amount)
- Tax calculation (25% Swedish VAT)
- Total calculation

**FR-CHE-003:** Shipping Address Section (Placeholder)
- Basic form fields (Name, Address, City, Postal Code, Country)
- For now: Display-only or basic form without validation
- Future: Connect to address book

**FR-CHE-004:** Payment Section (Placeholder)
- Placeholder text: "Stripe + Shopify integration coming soon"
- Demo button: "Place Order (Demo)"
- Demo behavior: Show success message, clear cart, create dummy order

#### 3.5.2 Demo Order Flow

**FR-CHE-005:** Demo order completion (no real payment)

**Flow:**
1. User reviews order summary
2. User clicks "Place Order (Demo)"
3. Show loading state
4. Create dummy order in localStorage (or show success immediately)
5. Clear cart
6. Show success message/page
7. Redirect to order confirmation or profile

---

### 3.6 Orders Display (Dummy Data)

**Priority:** Medium
**Effort:** Low

#### 3.6.1 Dummy Order Data

**FR-ORD-001:** Create dummy order structure

**File:** `/data/dummyOrders.ts` or inline in component

**Interface:**
```typescript
interface Order {
    id: string
    orderNumber: string
    date: string
    status: 'processing' | 'shipped' | 'delivered' | 'cancelled'
    items: OrderItem[]
    subtotal: number
    shipping: number
    tax: number
    total: number
}

interface OrderItem {
    productId: number
    name: string
    price: number
    quantity: number
    image: string
}
```

**Dummy Data Example:**
```typescript
const dummyOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'JOJO-2024-001',
    date: '2024-12-15',
    status: 'delivered',
    items: [
      { productId: 1, name: 'Vintage Jacket', price: 599, quantity: 1, image: '...' }
    ],
    subtotal: 599,
    shipping: 49,
    tax: 162,
    total: 810
  },
  // ... more orders
]
```

#### 3.6.2 Orders Modal

**FR-ORD-002:** Create orders modal (same style as wishlist modal)

**File:** `/components/OrdersModal.tsx`

**Features:**
- List all orders (dummy data)
- Each order shows: Order number, Date, Status badge, Total
- Click to expand/view order details
- Status badges with colors:
  - Processing: Yellow/warning
  - Shipped: Blue/info
  - Delivered: Green/success
  - Cancelled: Red/destructive

**Layout:**
```
┌────────────────────────────────────────────┐
│ Close [x]                                  │
├────────────────────────────────────────────┤
│                                            │
│ ORDERS & RETURNS                           │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ Order #JOJO-2024-001                   │ │
│ │ December 15, 2024                      │ │
│ │ [DELIVERED]              Total: 810 kr │ │
│ │ ──────────────────────────────────────│ │
│ │ [IMG] Vintage Jacket    1 × 599 kr    │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ Order #JOJO-2024-002                   │ │
│ │ December 18, 2024                      │ │
│ │ [PROCESSING]             Total: 450 kr │ │
│ └────────────────────────────────────────┘ │
│                                            │
└────────────────────────────────────────────┘
```

---

## 4. User Stories

### 4.1 Profile & Navigation

**US-001:** As a logged-in regular user, I want to see "Profile" in the menu instead of "Admin" so that I can access my account page.

**Acceptance Criteria:**
- Menu shows "Profile" for non-admin users
- Menu shows "Admin" for admin users
- Profile link navigates to `/profile`

**US-002:** As a user, I want to view my profile page to see an overview of my account, orders, and wishlist.

**Acceptance Criteria:**
- Profile page displays user email
- Shows sections for profile, orders, address book, wishlist
- Log out button works correctly
- Page is protected (requires authentication)

---

### 4.2 Wishlist

**US-003:** As a user, I want to add products to my wishlist so that I can save items for later.

**Acceptance Criteria:**
- Heart icon visible on product cards
- Clicking heart adds/removes from wishlist
- Visual feedback when item is in wishlist (filled heart)
- Wishlist persists across page refreshes

**US-004:** As a user, I want to view and manage my wishlist to see all saved products.

**Acceptance Criteria:**
- Wishlist modal opens from profile page
- Shows all wishlisted items
- Can remove items from wishlist
- Can add items to cart from wishlist
- Shows empty state when no items

---

### 4.3 Shopping Cart

**US-005:** As a user, I want to add products to my cart so that I can purchase them.

**Acceptance Criteria:**
- "Add to Cart" button on product pages
- Feedback when product is added
- Cart count updates in header

**US-006:** As a user, I want to view and edit my shopping cart.

**Acceptance Criteria:**
- Cart modal opens from header
- Shows all cart items with images
- Can adjust quantities
- Can remove items
- Shows subtotal
- "Proceed to Checkout" button works

---

### 4.4 Checkout

**US-007:** As a user, I want to review my order before payment.

**Acceptance Criteria:**
- Order summary shows all items
- Shows shipping cost
- Shows tax (25% VAT)
- Shows total
- Can go back to cart
- Demo "Place Order" button works

**US-008:** As a user, I want to complete a demo order to test the flow.

**Acceptance Criteria:**
- Demo button creates order
- Cart is cleared after order
- Success message displayed
- Order appears in order history (optional)

---

### 4.5 Orders

**US-009:** As a user, I want to view my order history to check past purchases.

**Acceptance Criteria:**
- Orders modal shows all orders (dummy data)
- Each order shows number, date, status, total
- Status is visually distinguished
- Can view order details

---

## 5. Technical Specifications

### 5.1 New Files to Create

```
/app/profile/page.tsx                    - Profile page
/components/ProfileSection.tsx           - Reusable profile section card
/components/CartModal.tsx                - Shopping cart modal
/components/WishlistModal.tsx            - Wishlist modal
/components/OrdersModal.tsx              - Orders history modal
/context/WishlistContext.tsx             - Wishlist state management
/types/wishlist.ts                       - Wishlist type definitions
/types/order.ts                          - Order type definitions
/data/dummyOrders.ts                     - Dummy order data
```

### 5.2 Files to Modify

```
/app/layout.tsx                          - Add WishlistProvider
/app/checkout/page.tsx                   - Enhance checkout flow
/components/Navigation-header/MenuOverlay.tsx - Conditional admin/profile link
/components/Navigation-header/HeaderNav.tsx   - Cart badge, cart modal trigger
/components/product-page/ProductCard.tsx      - Wishlist heart button
/components/product-page/ProductModalClient.tsx - Wishlist + Add to cart
```

### 5.3 Type Definitions

**File:** `/types/wishlist.ts`
```typescript
export interface WishlistItem {
    id: string
    productId: number
    name: string
    price: number
    image: string
    addedAt: Date
}

export interface WishlistState {
    items: WishlistItem[]
    lastUpdated: Date
}
```

**File:** `/types/order.ts`
```typescript
export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
    productId: number
    name: string
    price: number
    quantity: number
    image: string
}

export interface Order {
    id: string
    orderNumber: string
    date: string
    status: OrderStatus
    items: OrderItem[]
    subtotal: number
    shipping: number
    tax: number
    total: number
}
```

### 5.4 Component Architecture

**WishlistContext Pattern (follow CartContext):**
```typescript
// Actions
type WishlistAction =
    | { type: 'ADD_ITEM'; payload: WishlistItem }
    | { type: 'REMOVE_ITEM'; payload: number }  // productId
    | { type: 'CLEAR_WISHLIST' }
    | { type: 'LOAD_WISHLIST'; payload: WishlistItem[] }

// Storage key
const WISHLIST_STORAGE_KEY = 'product-wishlist'
```

**Modal Pattern (follow Login.tsx):**
```typescript
// Props
interface ModalProps {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

// Animation (Framer Motion)
// Slide in from right, lg:w-1/2
// Close button top-left
// Escape key handler
```

### 5.5 Styling Conventions

Follow existing patterns:
- **Container:** `jojo-main-wrapper-top`
- **Padding:** `jojo-container-padding` (px-3 py-9)
- **Fonts:**
  - Section titles: `font-mono text-sm`
  - Body text: `font-serif-book`
  - Buttons: Use `Button` component
- **Colors:**
  - Background: `bg-accent` for modals
  - Text: `text-accent-foreground`
  - Borders: `border-primary` or `border-black`
- **Layout:**
  - Two-column: `grid grid-cols-1 lg:grid-cols-2 gap-6`
  - Full-screen modal: `fixed inset-0 z-50`

---

## 6. Implementation Plan

### Phase 1: Foundation
**Tasks:**
1. Create WishlistContext following CartContext pattern
2. Add WishlistProvider to app layout
3. Create type definitions for wishlist and orders

**Deliverables:**
- Working wishlist context with localStorage persistence
- Types for all new features

---

### Phase 2: Navigation & Profile
**Tasks:**
1. Update MenuOverlay to show Profile/Admin conditionally
2. Create profile page with section layout
3. Create ProfileSection component
4. Add logout functionality

**Deliverables:**
- Profile page accessible at `/profile`
- Conditional navigation based on role
- Working logout

---

### Phase 3: Wishlist UI
**Tasks:**
1. Add wishlist toggle to ProductCard
2. Add wishlist toggle to ProductModalClient
3. Create WishlistModal component
4. Connect wishlist modal to profile page

**Deliverables:**
- Heart icons on product cards
- Functional wishlist modal
- Add to cart from wishlist

---

### Phase 4: Shopping Cart UI
**Tasks:**
1. Create CartModal component
2. Add cart badge to HeaderNav
3. Add "Add to Cart" buttons to product components
4. Wire up cart modal opening

**Deliverables:**
- Full cart modal with quantity controls
- Cart count badge in header
- Add to cart functionality

---

### Phase 5: Checkout Enhancement
**Tasks:**
1. Enhance checkout page with order summary
2. Add shipping/tax calculations
3. Create demo order flow
4. Handle cart clearing on order

**Deliverables:**
- Order review page
- Demo order completion
- Cart cleared after order

---

### Phase 6: Orders Display
**Tasks:**
1. Create dummy order data
2. Create OrdersModal component
3. Connect orders modal to profile page
4. Style order status badges

**Deliverables:**
- Orders modal with dummy data
- Status badges
- Order detail display

---

## 7. Acceptance Criteria Summary

### Must Have (MVP)
- [ ] Profile link in menu for regular users
- [ ] Profile page with basic sections
- [ ] Wishlist context with localStorage
- [ ] Wishlist toggle on product cards
- [ ] Wishlist modal from profile
- [ ] Cart modal with quantity controls
- [ ] Cart badge in header
- [ ] Checkout page with order summary
- [ ] Demo order flow
- [ ] Orders modal with dummy data

### Should Have
- [ ] Add to cart from wishlist
- [ ] Tax and shipping calculations
- [ ] Order status badges
- [ ] Empty state messages
- [ ] Animation/feedback on actions

### Could Have (Future)
- [ ] Address book functionality
- [ ] Profile editing (password change)
- [ ] Real order persistence (database)
- [ ] Email notifications
- [ ] Order tracking

---

## 8. Notes & Constraints

### Styling
- **IMPORTANT:** Follow existing styling patterns exactly
- Do not try to change or improve existing design
- Use existing components (Button, Input, Card) where applicable
- Maintain consistency with current color scheme and typography

### Technical
- Use Context7.com documentation for best practices
- All state management via React Context + localStorage
- No database changes required for MVP (use localStorage/dummy data)
- Checkout Stripe + Shopify integration deferred to later phase

### E-commerce Logic
- No real payment processing in this phase
- Orders are dummy/demo only
- Address book is placeholder only
- Future phases will add real functionality

---

## 9. Document Control

**Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-19 | Product Team | Initial PRD |

---

**END OF DOCUMENT**
