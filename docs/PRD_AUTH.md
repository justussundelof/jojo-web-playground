# Product Requirements Document: Authentication System

**Version:** 1.0
**Status:** Draft
**Last Updated:** 2025-12-18

---

## 1. Overview

### 1.1 Purpose

This PRD defines the requirements for a robust, bulletproof authentication system using Supabase Auth. The goal is to fix the existing buggy implementation and establish a reliable, maintainable auth architecture.

### 1.2 Current State Summary

The existing auth system has a solid foundation but suffers from critical implementation gaps:

| Component | Status | Issue |
|-----------|--------|-------|
| AuthContext | Broken | Missing `profile`, `role`, `isAdmin` - only exposes `user`, `session`, `loading` |
| useRole Hook | Broken | References non-existent properties from AuthContext |
| Login Redirect | Bug | Hardcoded redirect to `/admin` regardless of user role |
| Middleware | Working | Properly protects `/admin/*` routes |
| Database | Working | Profiles table with role enum, RLS policies correct |
| Supabase Clients | Working | Browser/server clients properly configured |

### 1.3 Goals

1. **Fix Critical Bugs**: Resolve broken hooks and missing context data
2. **Reliable State Management**: Single source of truth for auth state
3. **Role-Based Access**: Consistent role checking across client and server
4. **Graceful Error Handling**: No silent failures, proper error states
5. **Session Resilience**: Handle token refresh, expiry, and edge cases

---

## 2. User Roles

### 2.1 Role Definitions

| Role | Value | Description | Assignment |
|------|-------|-------------|------------|
| Regular User | `user` | Default role for all new signups | Automatic on registration |
| Admin User | `admin` | Elevated privileges | Manual update in Supabase Dashboard |

### 2.2 Role Storage

- Roles stored in `profiles.role` column (PostgreSQL enum: `user_role`)
- Profile created automatically via database trigger on signup
- Default role: `user`
- Admin promotion: Manual update via Supabase Dashboard or direct SQL

### 2.3 Role Assignment Flow

```
User Signs Up
    ↓
auth.users record created (Supabase)
    ↓
Trigger: on_auth_user_created fires
    ↓
Function: handle_new_user() executes
    ↓
profiles record created with role='user'
```

---

## 3. Authentication Requirements

### 3.1 AuthContext Requirements

The AuthContext must provide a complete, reactive auth state:

#### 3.1.1 Required Exports

```typescript
interface AuthContextType {
  // Core Auth State
  user: User | null                    // Supabase User object
  session: Session | null              // Supabase Session
  profile: Profile | null              // Profile from profiles table

  // Derived State
  role: UserRole | null                // 'user' | 'admin' | null
  isAdmin: boolean                     // Convenience: role === 'admin'
  isAuthenticated: boolean             // Convenience: user !== null

  // Loading States
  loading: boolean                     // Initial auth check in progress
  profileLoading: boolean              // Profile fetch in progress

  // Error State
  error: AuthError | null              // Last auth error

  // Actions
  signUp: (email: string, password: string) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<AuthResult>
  refreshProfile: () => Promise<void>  // Force refresh profile data
  clearError: () => void               // Clear error state
}
```

#### 3.1.2 Profile Type

```typescript
interface Profile {
  id: string
  email: string
  role: UserRole
  created_at: string
  updated_at: string
}

type UserRole = 'user' | 'admin'
```

#### 3.1.3 AuthResult Type

```typescript
interface AuthResult {
  success: boolean
  error?: string
  data?: any
}
```

### 3.2 State Synchronization Requirements

#### 3.2.1 Profile Fetch Timing

The AuthContext MUST fetch profile data:

1. **On initial load**: After session is restored from storage
2. **On sign in**: Immediately after successful authentication
3. **On auth state change**: When `onAuthStateChange` fires with `SIGNED_IN`
4. **On demand**: When `refreshProfile()` is called

#### 3.2.2 Profile Fetch Logic

```
Session exists?
    ├─ No  → Set profile = null, role = null, isAdmin = false
    └─ Yes → Fetch profile from profiles table
              ├─ Success → Update profile, role, isAdmin
              └─ Error → Set error state, keep profile null
```

#### 3.2.3 State Reset on Sign Out

On sign out, ALL state must reset:
- `user` → `null`
- `session` → `null`
- `profile` → `null`
- `role` → `null`
- `isAdmin` → `false`
- `isAuthenticated` → `false`
- `error` → `null`

### 3.3 Session Management Requirements

#### 3.3.1 Session Persistence

- Use Supabase's built-in session persistence (localStorage)
- Session auto-refreshes via `onAuthStateChange` listener

#### 3.3.2 Auth State Change Handling

The context must handle these events:

| Event | Action |
|-------|--------|
| `INITIAL_SESSION` | Restore session, fetch profile if session exists |
| `SIGNED_IN` | Update user/session, fetch profile |
| `SIGNED_OUT` | Reset all state to defaults |
| `TOKEN_REFRESHED` | Update session (user/profile unchanged) |
| `USER_UPDATED` | Update user object |

#### 3.3.3 Loading State Management

```
Component Mount
    ↓
loading = true
    ↓
Check for existing session
    ↓
Session found? → profileLoading = true → Fetch profile
    ↓
loading = false, profileLoading = false
```

**Critical**: Components must not render protected content while `loading` is `true`.

---

## 4. Hook Requirements

### 4.1 useAuth Hook

Primary hook for accessing auth context:

```typescript
function useAuth(): AuthContextType
```

Usage:
```typescript
const { user, profile, role, isAdmin, loading, signIn, signOut } = useAuth()
```

### 4.2 useRole Hook

Specialized hook for role-based access control:

```typescript
interface UseRoleReturn {
  role: UserRole | null
  isAdmin: boolean
  isUser: boolean
  loading: boolean
  hasRole: (requiredRole: UserRole) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
}

function useRole(): UseRoleReturn
```

#### 4.2.1 Implementation Requirements

- Must consume `AuthContext` via `useAuth()`
- Must handle loading states correctly
- Must return stable references (use `useCallback` for functions)

### 4.3 useRequireAuth Hook (New)

Hook for pages that require authentication:

```typescript
interface UseRequireAuthOptions {
  redirectTo?: string           // Default: '/login'
  requiredRole?: UserRole       // Optional role requirement
}

interface UseRequireAuthReturn {
  user: User
  profile: Profile
  isLoading: boolean
}

function useRequireAuth(options?: UseRequireAuthOptions): UseRequireAuthReturn
```

Behavior:
- Redirects to login if not authenticated (after loading completes)
- Redirects to home if role requirement not met
- Returns typed user/profile (non-null when not loading)

---

## 5. Login/Signup Flow Requirements

### 5.1 Sign Up Flow

```
User submits email + password
    ↓
Validate inputs (email format, password strength)
    ↓
Call supabase.auth.signUp()
    ↓
├─ Error → Display error message, stay on form
└─ Success →
      ↓
      Email confirmation required?
      ├─ Yes → Show "Check your email" message
      └─ No → Auto sign-in, redirect based on role
```

#### 5.1.1 Password Requirements

- Minimum 6 characters (Supabase default)
- Display clear requirements to user
- Show password strength indicator (optional)

#### 5.1.2 Email Validation

- Client-side: Basic format validation
- Server-side: Supabase validates uniqueness

### 5.2 Sign In Flow

```
User submits email + password
    ↓
Call supabase.auth.signInWithPassword()
    ↓
├─ Error → Display error message
└─ Success →
      ↓
      AuthContext updates (user, session)
      ↓
      Profile fetched automatically
      ↓
      Redirect based on role:
      ├─ Admin → /admin
      └─ User → / (or previous intended page)
```

#### 5.2.1 Redirect Logic (Critical Fix)

Current bug: Hardcoded redirect to `/admin` for all users.

**Required behavior:**

```typescript
async function handleSignIn() {
  const result = await signIn(email, password)

  if (!result.success) {
    setError(result.error)
    return
  }

  // Wait for profile to be fetched
  // The role will be available after context updates

  // Get intended destination (stored before login redirect)
  const intendedPath = sessionStorage.getItem('intendedPath') || '/'
  sessionStorage.removeItem('intendedPath')

  // Redirect based on role
  if (profile?.role === 'admin') {
    router.push(intendedPath.startsWith('/admin') ? intendedPath : '/admin')
  } else {
    // Non-admin users should never go to /admin
    router.push(intendedPath.startsWith('/admin') ? '/' : intendedPath)
  }
}
```

### 5.3 Sign Out Flow

```
User clicks sign out
    ↓
Call signOut() from context
    ↓
Context resets all state
    ↓
Redirect to home page
```

### 5.4 Password Reset Flow

```
User requests password reset
    ↓
Call resetPassword(email)
    ↓
Supabase sends email with reset link
    ↓
User clicks link → /reset-password?token=...
    ↓
User enters new password
    ↓
Call supabase.auth.updateUser({ password })
    ↓
Redirect to login with success message
```

**Required**: Create `/reset-password` page (currently missing).

---

## 6. Route Protection Requirements

### 6.1 Middleware Protection (Server-Side)

The middleware must:

1. Run on all routes except static files
2. Check authentication for protected routes
3. Verify role for role-restricted routes
4. Redirect appropriately

#### 6.1.1 Protected Route Patterns

| Pattern | Requirement |
|---------|-------------|
| `/admin/*` | Must be authenticated with `role = 'admin'` |
| `/checkout/*` | Must be authenticated (any role) |
| `/profile/*` | Must be authenticated (any role) |

#### 6.1.2 Middleware Logic

```typescript
// Middleware pseudo-code
const protectedRoutes = ['/checkout', '/profile']
const adminRoutes = ['/admin']

if (adminRoutes.some(r => path.startsWith(r))) {
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (profile?.role !== 'admin') redirect('/')
}

if (protectedRoutes.some(r => path.startsWith(r))) {
  if (!user) {
    // Store intended path for post-login redirect
    redirect(`/login?redirect=${encodeURIComponent(path)}`)
  }
}
```

### 6.2 Client-Side Protection

Use `useRequireAuth` hook in page components:

```typescript
// Example: Protected page component
export default function ProfilePage() {
  const { user, profile, isLoading } = useRequireAuth()

  if (isLoading) return <LoadingSpinner />

  return <ProfileContent user={user} profile={profile} />
}
```

```typescript
// Example: Admin-only page component
export default function AdminPage() {
  const { user, profile, isLoading } = useRequireAuth({ requiredRole: 'admin' })

  if (isLoading) return <LoadingSpinner />

  return <AdminDashboard />
}
```

---

## 7. Error Handling Requirements

### 7.1 Error Types

```typescript
interface AuthError {
  code: string
  message: string
  status?: number
}
```

### 7.2 Error Scenarios

| Scenario | Error Code | User Message |
|----------|------------|--------------|
| Invalid credentials | `invalid_credentials` | "Invalid email or password" |
| Email already exists | `email_exists` | "An account with this email already exists" |
| Weak password | `weak_password` | "Password must be at least 6 characters" |
| Network error | `network_error` | "Connection error. Please try again" |
| Session expired | `session_expired` | "Your session has expired. Please sign in again" |
| Profile not found | `profile_not_found` | "Account setup incomplete. Please contact support" |
| Rate limited | `rate_limited` | "Too many attempts. Please wait and try again" |

### 7.3 Error Display

- Show errors inline near relevant form fields
- Auto-dismiss success messages after 5 seconds
- Persistent errors until user action
- Clear errors when user starts typing

### 7.4 Error Recovery

| Error | Recovery Action |
|-------|-----------------|
| Session expired | Redirect to login, preserve intended path |
| Profile not found | Attempt to create profile, show error if fails |
| Network error | Show retry button, don't clear form |
| Rate limited | Show countdown timer |

---

## 8. Edge Cases & Race Conditions

### 8.1 Critical Edge Cases to Handle

#### 8.1.1 Double Sign-In Prevention

```typescript
// Prevent multiple simultaneous sign-in attempts
const [isSigningIn, setIsSigningIn] = useState(false)

async function handleSignIn() {
  if (isSigningIn) return
  setIsSigningIn(true)
  try {
    await signIn(email, password)
  } finally {
    setIsSigningIn(false)
  }
}
```

#### 8.1.2 Stale Closure Prevention

```typescript
// Use refs for values needed in callbacks
const userRef = useRef(user)
useEffect(() => {
  userRef.current = user
}, [user])
```

#### 8.1.3 Component Unmount During Auth

```typescript
// Cancel pending operations on unmount
useEffect(() => {
  let isMounted = true

  async function fetchProfile() {
    const data = await getProfile()
    if (isMounted) setProfile(data)
  }

  fetchProfile()
  return () => { isMounted = false }
}, [user])
```

#### 8.1.4 Rapid Navigation

Handle user navigating away before auth completes:
- Don't throw errors
- Cancel pending redirects
- Clean up listeners

### 8.2 Race Condition Prevention

#### 8.2.1 Profile Fetch Race

If profile fetch is in progress and user signs out:

```typescript
const fetchIdRef = useRef(0)

async function fetchProfile() {
  const currentFetchId = ++fetchIdRef.current

  const data = await supabase.from('profiles').select()

  // Only update if this is still the latest fetch
  if (currentFetchId === fetchIdRef.current) {
    setProfile(data)
  }
}
```

#### 8.2.2 Auth State Race

If multiple `onAuthStateChange` events fire rapidly:

```typescript
// Use a queue or debounce pattern
const processAuthChange = useMemo(
  () => debounce(async (event, session) => {
    // Handle auth change
  }, 100),
  []
)
```

---

## 9. Implementation Checklist

### Phase 1: Fix Critical Bugs

- [ ] **Update AuthContext**
  - [ ] Add `profile`, `role`, `isAdmin`, `isAuthenticated` to state
  - [ ] Add `profileLoading` state
  - [ ] Add `error` state
  - [ ] Implement `fetchProfile()` function
  - [ ] Call `fetchProfile()` on auth state changes
  - [ ] Add `refreshProfile()` action
  - [ ] Add `clearError()` action
  - [ ] Export `UserRole` and `Profile` types

- [ ] **Fix useRole Hook**
  - [ ] Update to use correct AuthContext properties
  - [ ] Remove invalid type import
  - [ ] Add proper type definitions
  - [ ] Implement `hasRole` and `hasAnyRole` correctly

- [ ] **Fix Login Component**
  - [ ] Remove hardcoded `/admin` redirect
  - [ ] Implement role-based redirect logic
  - [ ] Add intended path preservation
  - [ ] Improve error display

### Phase 2: Enhance Robustness

- [ ] **Add useRequireAuth Hook**
  - [ ] Implement redirect logic
  - [ ] Handle loading states
  - [ ] Support role requirements

- [ ] **Improve Error Handling**
  - [ ] Map Supabase errors to user-friendly messages
  - [ ] Add error boundaries for auth components
  - [ ] Implement retry logic for transient failures

- [ ] **Add Loading States**
  - [ ] Create consistent loading UI
  - [ ] Prevent content flash during auth check

### Phase 3: Complete Features

- [ ] **Create Reset Password Page**
  - [ ] Build `/reset-password` route
  - [ ] Handle token from URL
  - [ ] Implement password update

- [ ] **Improve Middleware**
  - [ ] Add redirect URL preservation
  - [ ] Standardize protected route patterns

---

## 10. Testing Requirements

### 10.1 Manual Test Cases

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Sign up new user | Enter valid email/password | Account created, role = 'user' |
| Sign in as user | Enter valid credentials | Redirected to home, not /admin |
| Sign in as admin | Enter admin credentials | Redirected to /admin |
| Access /admin as user | Sign in as user, navigate to /admin | Redirected to home |
| Access /admin as guest | Navigate to /admin when logged out | Redirected to login |
| Sign out | Click sign out | All state cleared, redirected home |
| Session restore | Sign in, close tab, reopen | Still signed in, profile loaded |
| Token refresh | Wait for token expiry | Session refreshes automatically |
| Invalid password | Enter wrong password | Error message shown |
| Reset password | Request reset, click link, set new password | Password updated |

### 10.2 Edge Case Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Double click sign in | Click sign in rapidly | Only one request sent |
| Sign out during profile fetch | Sign out while profile loading | No errors, state reset |
| Navigate during sign in | Start sign in, navigate away | No errors |
| Expired reset token | Use old reset link | Error message shown |
| Profile missing | Delete profile, reload | Error handled gracefully |

---

## 11. Security Considerations

### 11.1 Client-Side

- Never store sensitive data in localStorage (except Supabase session)
- Always validate user input before sending
- Use HTTPS for all requests
- Clear auth state completely on sign out

### 11.2 Server-Side

- RLS policies enforce data access at database level
- Middleware verifies auth for protected routes
- Never trust client-provided role information
- Always fetch role from database in middleware

### 11.3 Token Security

- Supabase handles JWT signing and verification
- Tokens auto-refresh before expiry
- Refresh tokens rotated on use
- Session invalidation clears all tokens

---

## 12. Success Metrics

After implementation, the auth system should:

1. **Zero Runtime Errors**: No undefined property access, no type errors
2. **Consistent State**: Client and server always agree on auth state
3. **Proper Redirects**: Users land on appropriate pages based on role
4. **Fast Loading**: Auth check completes in < 500ms
5. **Graceful Degradation**: Network failures show helpful errors
6. **No Flicker**: Protected content doesn't flash before redirect

---

## Appendix A: File Structure

```
├── context/
│   └── AuthContext.tsx          # Main auth context (to be fixed)
├── hooks/
│   ├── useRole.ts               # Role access hook (to be fixed)
│   └── useRequireAuth.ts        # New: protected page hook
├── components/
│   └── Login.tsx                # Login/signup UI (redirect to fix)
├── app/
│   ├── login/
│   │   └── page.tsx             # Login page
│   ├── reset-password/
│   │   └── page.tsx             # New: password reset page
│   └── api/auth/
│       └── signout/route.ts     # Signout endpoint
├── utils/supabase/
│   ├── client.ts                # Browser client (working)
│   ├── server.ts                # Server client (working)
│   └── middleware.ts            # Middleware client (working)
├── middleware.ts                # Route protection (to enhance)
└── supabase/migrations/
    ├── 006_add_user_profiles_and_roles.sql
    └── 007_fix_profile_insert_policy.sql
```

---

## Appendix B: Type Definitions

```typescript
// types/auth.ts

export type UserRole = 'user' | 'admin'

export interface Profile {
  id: string
  email: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface AuthError {
  code: string
  message: string
  status?: number
}

export interface AuthResult {
  success: boolean
  error?: string
  data?: unknown
}

export interface AuthContextType {
  // State
  user: User | null
  session: Session | null
  profile: Profile | null
  role: UserRole | null
  isAdmin: boolean
  isAuthenticated: boolean
  loading: boolean
  profileLoading: boolean
  error: AuthError | null

  // Actions
  signUp: (email: string, password: string) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<AuthResult>
  refreshProfile: () => Promise<void>
  clearError: () => void
}
```

---

## Appendix C: Database Schema Reference

```sql
-- User role enum
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update own profile (except role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Automatic profile creation trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```
