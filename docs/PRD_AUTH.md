# Product Requirements Document: Authentication System

**Version:** 2.0
**Status:** Draft
**Last Updated:** 2025-12-18

---

## 1. Overview

### 1.1 Purpose

This PRD defines the requirements for a robust authentication system using Supabase Auth, including user roles, profile management, and role-aware UI components.

### 1.2 User Roles

| Role | Value | Description | Assignment |
|------|-------|-------------|------------|
| Regular User | `user` | Default role for all new signups | Automatic on registration |
| Admin User | `admin` | Elevated privileges | Manual update in Supabase Dashboard |

---

## 2. Current State Analysis

### 2.1 What's Working

| Component | File | Status |
|-----------|------|--------|
| Supabase Clients | `utils/supabase/client.ts`, `server.ts` | Working |
| Middleware Protection | `middleware.ts` | Working - protects `/admin/*` routes |
| Database Schema | `006_add_user_profiles_and_roles.sql` | Working - profiles table with RLS |
| Login UI | `components/Login.tsx` | Working - sign-in, sign-up, forgot password views |
| Header Sign In/Out Button | `components/HeaderNav.tsx:113-116` | Working - toggles between "Sign In" and "Sign Out" |

### 2.2 Critical Bugs

#### Bug #1: AuthContext Missing Profile Data

**File:** `context/AuthContext.tsx`

**Current exports:**
```typescript
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp, signIn, signOut, resetPassword
}
```

**Problem:** Missing `profile`, `role`, `isAdmin`. The context never fetches profile data from the database.

**Impact:**
- `HeaderNav.tsx:42` tries to use `profile` - will be undefined
- `HeaderNav.tsx:74-77` tries to access `profile?.first_name` - fails silently
- `useRole.ts:7` tries to destructure `role, isAdmin` - will be undefined

---

#### Bug #2: useRole Hook Broken

**File:** `hooks/useRole.ts`

```typescript
// Line 4: Imports non-existent type
import type { UserRole } from '@/context/AuthContext'

// Line 7: Destructures non-existent properties
const { role, isAdmin, loading } = useAuth()
```

**Impact:** Hook will fail at runtime. Any component using `useRole()` will crash.

---

#### Bug #3: Login Redirect Hardcoded to /admin

**File:** `components/Login.tsx:59`

```typescript
router.push("/admin")  // Always goes to admin, regardless of role
```

**Impact:** Regular users are redirected to `/admin`, then immediately kicked back to `/` by middleware. Bad UX.

---

#### Bug #4: MenuOverlay Not Auth-Aware

**File:** `components/MenuOverlay.tsx`

**Problems:**
- Line 89-91: Shows "Log In" button but doesn't use auth state
- Line 131: "Admin" link shown to all users, should be conditional
- No "Account" option for regular users
- Doesn't sync with HeaderNav login state

---

#### Bug #5: Profile Schema Missing Name Fields

**File:** `supabase/migrations/006_add_user_profiles_and_roles.sql`

**Current columns:**
- `id`, `email`, `role`, `created_at`, `updated_at`

**Missing:**
- `first_name`
- `last_name`

---

### 2.3 Current Auth Flow

```
1. User signs up → auth.users created → trigger creates profile (role='user')
2. User signs in → AuthContext updates user/session (profile NOT fetched)
3. Login.tsx redirects to /admin (BUG: should check role)
4. Middleware checks profile.role → non-admins redirected to /
5. HeaderNav shows "Sign Out" (working) but can't show first_name (profile null)
```

---

## 3. Feature Requirements

### 3.1 Profile Fields Enhancement

#### 3.1.1 Add Name Fields to Database

Create new migration to add:
- `first_name TEXT`
- `last_name TEXT`

Update trigger `handle_new_user()` to accept name parameters.

#### 3.1.2 Profile Type Definition

```typescript
interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

type UserRole = 'user' | 'admin'
```

---

### 3.2 Sign Up Form Enhancement

#### 3.2.1 Add Name Fields to Sign Up

**File to modify:** `components/Login.tsx`

Add to sign-up form:
- First Name input (required)
- Last Name input (required)

#### 3.2.2 Pass Name to Supabase

```typescript
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      first_name: firstName,
      last_name: lastName,
    }
  }
})
```

#### 3.2.3 Update Database Trigger

Modify `handle_new_user()` to read from `raw_user_meta_data`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 3.3 AuthContext Requirements

#### 3.3.1 Required Exports

```typescript
interface AuthContextType {
  // Core State
  user: User | null
  session: Session | null
  profile: Profile | null

  // Derived State
  role: UserRole | null
  isAdmin: boolean
  isAuthenticated: boolean

  // Loading States
  loading: boolean           // Initial auth check
  profileLoading: boolean    // Profile fetch in progress

  // Error State
  error: AuthError | null

  // Actions
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<AuthResult>
  refreshProfile: () => Promise<void>
  clearError: () => void
}
```

#### 3.3.2 Profile Fetch Logic

The context MUST fetch profile when:
1. Initial session is restored
2. User signs in
3. `onAuthStateChange` fires with `SIGNED_IN`
4. `refreshProfile()` is called manually

```typescript
async function fetchProfile(userId: string) {
  setProfileLoading(true)
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    setError({ code: 'profile_fetch_failed', message: error.message })
    setProfile(null)
  } else {
    setProfile(data)
  }
  setProfileLoading(false)
}
```

#### 3.3.3 Derived State Computation

```typescript
const role = profile?.role ?? null
const isAdmin = role === 'admin'
const isAuthenticated = user !== null
```

---

### 3.4 Login Redirect Logic

#### 3.4.1 Role-Based Redirect After Sign In

**File:** `components/Login.tsx`

Replace hardcoded `/admin` redirect:

```typescript
const handleLogin = async (e: FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError(null)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    setError(error.message)
    setLoading(false)
    return
  }

  // Fetch profile to determine role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  setOpenLogin(false)

  // Redirect based on role
  if (profile?.role === 'admin') {
    router.push('/admin')
  } else {
    router.push('/account')  // Regular users go to account page
  }
  router.refresh()
}
```

---

### 3.5 User Name Button Component

#### 3.5.1 Component Requirements

Create `components/UserButton.tsx`:

```typescript
interface UserButtonProps {
  className?: string
}

function UserButton({ className }: UserButtonProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  if (loading || !user) return null

  const displayName = profile?.first_name || 'Account'

  return (
    <Button
      variant="link"
      size="sm"
      className={className}
      onClick={() => router.push('/account')}
    >
      {displayName}
    </Button>
  )
}
```

#### 3.5.2 Display Rules

| State | Display |
|-------|---------|
| Not logged in | Don't render |
| Logged in, no first_name | Show "Account" |
| Logged in, has first_name | Show first name |

---

### 3.6 Header Navigation Updates

#### 3.6.1 HeaderNav Requirements

**File:** `components/HeaderNav.tsx`

Current line 111-117:
```typescript
<Button onClick={user ? handleSignOut : () => setOpenLogin(!openLogin)}>
  {user ? "Sign Out" : "Sign In"}
</Button>
```

Add UserButton when logged in:
```typescript
{user && <UserButton />}
<Button onClick={user ? handleSignOut : () => setOpenLogin(!openLogin)}>
  {user ? "Sign Out" : "Sign In"}
</Button>
```

---

### 3.7 Menu Overlay Updates

#### 3.7.1 MenuOverlay Requirements

**File:** `components/MenuOverlay.tsx`

**Current menu items (line 125-132):**
```typescript
{ label: "Admin", href: "/admin" }  // Shown to everyone
```

**Required behavior:**

| User State | Menu Item | Link |
|------------|-----------|------|
| Not logged in | "Sign In" | Opens login modal |
| Logged in as `user` | "Account" | `/account` |
| Logged in as `admin` | "Admin" | `/admin` |

#### 3.7.2 Implementation

```typescript
// In MenuOverlay.tsx
const { user, profile, isAdmin } = useAuth()

// In menu items array:
const menuItems = [
  { label: "Products", href: "/" },
  { label: "Visit The Store", href: "/" },
  { label: "About JOJO", href: "/pages/about" },
  { label: "Privacy Policy", href: "/pages/privacy-policy" },
  { label: "Imprint", href: "/pages/imprint" },
  // Conditional item:
  ...(user
    ? [{ label: isAdmin ? "Admin" : "Account", href: isAdmin ? "/admin" : "/account" }]
    : []
  ),
]
```

#### 3.7.3 Sync Login Button with Auth State

Replace static "Log In" button (line 89-91):
```typescript
<Button onClick={user ? handleSignOut : () => openLoginModal()}>
  {user ? "Sign Out" : "Sign In"}
</Button>
```

---

### 3.8 Account Page

#### 3.8.1 Create `/account` Route

**File:** `app/account/page.tsx`

Page requirements:
- Protected route (requires authentication)
- Shows user profile information
- Shows order history
- Link to edit profile (future)

#### 3.8.2 Account Page Layout

```
┌─────────────────────────────────────────┐
│  Account                                │
├─────────────────────────────────────────┤
│  Welcome, {first_name}!                 │
│  {email}                                │
├─────────────────────────────────────────┤
│  Your Orders                            │
│  ─────────────────────────────────────  │
│  Order #123 - Dec 15, 2025 - $99.00    │
│  Order #122 - Dec 10, 2025 - $150.00   │
│  ...                                    │
│  ─────────────────────────────────────  │
│  No orders yet? Start shopping →       │
└─────────────────────────────────────────┘
```

#### 3.8.3 Middleware Protection

Add `/account` to protected routes in `middleware.ts`:

```typescript
// Protect account routes
if (request.nextUrl.pathname.startsWith("/account")) {
  if (!user) {
    return NextResponse.redirect(new URL("/?login=true", request.url))
  }
}
```

---

## 4. useRole Hook Fix

### 4.1 Updated Implementation

**File:** `hooks/useRole.ts`

```typescript
'use client'

import { useAuth } from '@/context/AuthContext'

export type UserRole = 'user' | 'admin'

export function useRole() {
  const { role, isAdmin, loading, profileLoading } = useAuth()

  const hasRole = (requiredRole: UserRole): boolean => {
    if (loading || profileLoading) return false
    return role === requiredRole
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (loading || profileLoading) return false
    return role !== null && roles.includes(role)
  }

  return {
    role,
    isAdmin,
    isUser: role === 'user',
    loading: loading || profileLoading,
    hasRole,
    hasAnyRole,
  }
}
```

---

## 5. Error Handling

### 5.1 Error Scenarios

| Scenario | Code | Message |
|----------|------|---------|
| Invalid credentials | `invalid_credentials` | "Invalid email or password" |
| Email exists | `email_exists` | "An account with this email already exists" |
| Weak password | `weak_password` | "Password must be at least 6 characters" |
| Network error | `network_error` | "Connection error. Please try again" |
| Profile not found | `profile_not_found` | "Account setup incomplete" |
| Session expired | `session_expired` | "Session expired. Please sign in again" |

### 5.2 Error Display

- Inline errors near form fields
- Toast notifications for async errors
- Auto-clear on user input

---

## 6. Edge Cases

### 6.1 Race Conditions to Handle

| Scenario | Solution |
|----------|----------|
| Sign out during profile fetch | Cancel fetch, reset state |
| Multiple rapid sign-in attempts | Disable button during request |
| Navigate away during auth | Clean up listeners |
| Token refresh during request | Let Supabase handle automatically |

### 6.2 State Synchronization

| Scenario | Behavior |
|----------|----------|
| Profile updated in another tab | Detect via `onAuthStateChange` |
| Role changed by admin | Next page load fetches new profile |
| Session expired | Auto sign-out, show message |

---

## 7. Database Migration

### 7.1 New Migration: Add Name Fields

**File:** `supabase/migrations/008_add_profile_name_fields.sql`

```sql
-- Add name fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Update the handle_new_user function to include names
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 8. Implementation Checklist

### Phase 1: Fix Critical Bugs

- [ ] **AuthContext** (`context/AuthContext.tsx`)
  - [ ] Add profile state
  - [ ] Add role, isAdmin, isAuthenticated derived state
  - [ ] Add profileLoading state
  - [ ] Add error state
  - [ ] Implement fetchProfile function
  - [ ] Call fetchProfile on auth state changes
  - [ ] Update signUp to accept firstName, lastName
  - [ ] Export Profile and UserRole types

- [ ] **useRole Hook** (`hooks/useRole.ts`)
  - [ ] Remove invalid import
  - [ ] Define UserRole type locally or import from AuthContext
  - [ ] Use correct properties from useAuth

- [ ] **Login Redirect** (`components/Login.tsx`)
  - [ ] Fetch profile after login
  - [ ] Redirect based on role (admin → /admin, user → /account)

### Phase 2: Add Name Fields

- [ ] **Database Migration**
  - [ ] Create `008_add_profile_name_fields.sql`
  - [ ] Add first_name, last_name columns
  - [ ] Update handle_new_user trigger

- [ ] **Sign Up Form** (`components/Login.tsx`)
  - [ ] Add firstName state
  - [ ] Add lastName state
  - [ ] Add First Name input field
  - [ ] Add Last Name input field
  - [ ] Pass names to signUp via user_metadata

### Phase 3: UI Components

- [ ] **UserButton Component** (`components/UserButton.tsx`)
  - [ ] Create component
  - [ ] Show first name or "Account"
  - [ ] Navigate to /account on click

- [ ] **HeaderNav Updates** (`components/HeaderNav.tsx`)
  - [ ] Import and use UserButton
  - [ ] Show UserButton when logged in

- [ ] **MenuOverlay Updates** (`components/MenuOverlay.tsx`)
  - [ ] Import useAuth
  - [ ] Make "Admin"/"Account" menu item conditional
  - [ ] Sync Sign In/Sign Out button with auth state

### Phase 4: Account Page

- [ ] **Create Account Page** (`app/account/page.tsx`)
  - [ ] Require authentication
  - [ ] Display profile info
  - [ ] Display orders (future: fetch from orders table)

- [ ] **Middleware Update** (`middleware.ts`)
  - [ ] Protect /account routes

---

## 9. File Changes Summary

| File | Action | Changes |
|------|--------|---------|
| `context/AuthContext.tsx` | Modify | Add profile, role, derived states, fetchProfile |
| `hooks/useRole.ts` | Modify | Fix imports, use correct context properties |
| `components/Login.tsx` | Modify | Add name fields, fix redirect logic |
| `components/UserButton.tsx` | Create | New component for user name button |
| `components/HeaderNav.tsx` | Modify | Add UserButton |
| `components/MenuOverlay.tsx` | Modify | Conditional Admin/Account, sync auth state |
| `app/account/page.tsx` | Create | New account/profile page |
| `middleware.ts` | Modify | Protect /account routes |
| `supabase/migrations/008_*.sql` | Create | Add name fields to profiles |

---

## 10. Testing Checklist

### Functional Tests

| Test | Steps | Expected |
|------|-------|----------|
| Sign up with name | Fill form with first/last name | Profile created with names |
| Sign in as user | Log in as regular user | Redirect to /account |
| Sign in as admin | Log in as admin | Redirect to /admin |
| User name button | Sign in, check header | Shows first name, clicks to /account |
| Menu - regular user | Sign in as user, open menu | Shows "Account" not "Admin" |
| Menu - admin | Sign in as admin, open menu | Shows "Admin" |
| Menu - guest | Open menu when logged out | No Admin/Account, shows Sign In |
| Account page access | Navigate to /account when logged in | Page loads |
| Account page protection | Navigate to /account when logged out | Redirect to home |

### Edge Cases

| Test | Expected |
|------|----------|
| Sign in, lose connection during profile fetch | Error shown, retry option |
| Sign out during profile fetch | Clean state reset |
| Refresh page while logged in | Session restored, profile loaded |
| Admin demoted to user | Next login redirects to /account |

---

## Appendix A: Type Definitions

```typescript
// types/auth.ts

export type UserRole = 'user' | 'admin'

export interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface AuthError {
  code: string
  message: string
}

export interface AuthResult {
  success: boolean
  error?: string
}

export interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  role: UserRole | null
  isAdmin: boolean
  isAuthenticated: boolean
  loading: boolean
  profileLoading: boolean
  error: AuthError | null
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<AuthResult>
  refreshProfile: () => Promise<void>
  clearError: () => void
}
```

---

## Appendix B: Component Tree

```
App
├── AuthProvider (context/AuthContext.tsx)
│   └── ... all components have access to auth
│
├── HeaderNav (components/HeaderNav.tsx)
│   ├── UserButton (when logged in)
│   ├── Sign In / Sign Out Button
│   └── Login Modal (components/Login.tsx)
│
├── MenuOverlay (components/MenuOverlay.tsx)
│   ├── Sign In / Sign Out (synced with auth)
│   └── Admin / Account (conditional on role)
│
├── /admin/* (protected: admin only)
│   └── Middleware checks role
│
└── /account (protected: any authenticated user)
    └── Account page with profile + orders
```
