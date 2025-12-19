# PRD: Authentication System Fixes

## Overview

This document details critical bugs and required improvements for the JOJO Studio authentication system. The current implementation has several issues that cause a broken user experience when logging in.

---

## Problem Summary

Users experience the following issues when trying to log in:

1. **Login modal doesn't close properly** after successful authentication
2. **Header still shows "Log In"** even when user is authenticated
3. **Non-admin users have issues signing in** due to profile loading problems
4. **No visual feedback** indicating the user is logged in

---

## Issue Analysis

### Issue 1: LogInButton Never Checks Authentication State (CRITICAL)

**File:** `components/Navigation-header/LogInButton.tsx`

**Problem:** The LogInButton component is hardcoded to always display "Log In" regardless of authentication status:

```tsx
// Current implementation - BROKEN
export default function LogInButton({...}) {
  return (
    <Button onClick={() => setOpenLogin(!openLogin)} variant="link" size="sm">
      Log In  // <-- Always shows "Log In"
    </Button>
  );
}
```

**Impact:**
- Users cannot tell if they're logged in by looking at the header
- Clicking "Log In" when already authenticated opens an unnecessary modal
- Violates expected UX patterns

**Required Fix:**
- Import `useAuth` hook
- Check `isAuthenticated` and `profile` state
- When authenticated: Display user email/name
- When not authenticated: Display "Log In" button
- Optionally add a dropdown with Profile/Logout options when authenticated

---

### Issue 2: Login Component Violates React Rules of Hooks (CRITICAL)

**File:** `components/Login.tsx:18`

**Problem:** The component has an early return BEFORE hook calls:

```tsx
export default function Login({...}) {
  if (!openLogin) return null;  // <-- Early return BEFORE hooks!

  const router = useRouter();          // Hook called conditionally - INVALID
  const searchParams = useSearchParams();  // Hook called conditionally - INVALID
  const { signIn, ... } = useAuth();   // Hook called conditionally - INVALID
  // ...
}
```

**Impact:**
- Violates React's Rules of Hooks
- Causes unpredictable behavior and state issues
- May cause hydration mismatches in Next.js
- Hooks must always be called in the same order on every render

**Required Fix:**
- Move ALL hooks to the top of the component, before any conditional returns
- Move the `if (!openLogin) return null` check AFTER all hook calls
- Example:

```tsx
export default function Login({...}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, resetPassword, profile, loading: authLoading } = useAuth();
  const [view, setView] = useState<AuthView>("sign-in");
  // ... all other hooks

  // Conditional return AFTER all hooks
  if (!openLogin) return null;

  // ... rest of component
}
```

---

### Issue 3: Redirect Logic Fails Due to Component Unmount (CRITICAL)

**File:** `components/Login.tsx:72, 77-100`

**Problem:** The redirect logic is in a `useEffect` that depends on `profile` loading, but the component unmounts before this effect can run:

```tsx
// Line 72: Modal closes immediately after signIn succeeds
setOpenLogin(false);  // This unmounts the Login component!

// Lines 77-100: This useEffect will NEVER run because component is unmounted
useEffect(() => {
  if (!authLoading && profile) {
    // Redirect based on role - THIS NEVER EXECUTES
    if (profile.role === "admin") {
      router.push("/admin");
    } else {
      router.push(intendedPath);
    }
  }
}, [profile, authLoading, router]);
```

**Flow of failure:**
1. User submits login form
2. `signIn()` returns success
3. `setOpenLogin(false)` is called
4. Component unmounts (due to `if (!openLogin) return null`)
5. The `useEffect` for redirect never runs
6. User stays on same page, modal is closed, no redirect happens

**Impact:**
- Users are not redirected after login
- No visual confirmation of successful login
- Confusing UX - did the login work?

**Required Fixes:**

**Option A: Move redirect logic to parent component (Recommended)**
- Handle redirects in `HeaderNav` or a higher-level component that doesn't unmount
- Pass authentication success callback from parent to Login component

**Option B: Wait for profile before closing modal**
- Don't close the modal until profile is loaded
- Show a loading state in the modal
- Then redirect and close

**Option C: Use authentication state change listener outside the modal**
- Create a separate component/hook that listens for auth changes
- Handle redirects globally, not in the modal

---

### Issue 4: Profile May Not Exist for New Users (HIGH)

**File:** `context/AuthContext.tsx:36-60`

**Problem:** When a user signs up, there may not be a corresponding row in the `profiles` table. The `fetchProfile` function will fail:

```tsx
const { data, error: fetchError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();  // <-- Fails if no row exists

if (fetchError) {
  setError({
    code: 'profile_not_found',
    message: 'Account setup incomplete. Please contact support.',  // <-- User sees error
  });
  setProfile(null);  // <-- profile is null even though user is authenticated
}
```

**Impact:**
- New users who sign up cannot access protected routes
- `isAuthenticated` is true but `profile` is null
- Role-based features don't work (isAdmin is false)
- Error message "Account setup incomplete" is confusing

**Required Fixes:**

1. **Create Database Trigger (Recommended)**
   - Add a Supabase database trigger to auto-create a profile row on user signup
   - Example SQL:
   ```sql
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS trigger AS $$
   BEGIN
     INSERT INTO public.profiles (id, email, role, created_at, updated_at)
     VALUES (new.id, new.email, 'user', now(), now());
     RETURN new;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

2. **Handle Missing Profile Gracefully**
   - If profile doesn't exist, create it on first login
   - Or: Allow authenticated users without profile to access basic features

---

### Issue 5: No Loading/Success States in Header Button (MEDIUM)

**File:** `components/Navigation-header/LogInButton.tsx`

**Problem:** The login button shows no indication when:
- Authentication is in progress
- User has successfully logged in
- There's an error

**Impact:**
- Poor UX during login flow
- Users don't know if their action worked

**Required Fix:**
- Show loading spinner during authentication
- Animate transition from "Log In" to user name
- Add subtle feedback for state changes

---

### Issue 6: No Mobile Auth UI in Header (MEDIUM)

**File:** `components/Navigation-header/HeaderNav.tsx`

**Problem:** On mobile (`lg:hidden`), the LogInButton is hidden. Users can only access auth through the menu overlay.

```tsx
<motion.div className="hidden lg:block" variants={headerItemVariants}>
  <LogInButton openLogin={openLogin} setOpenLogin={setOpenLogin} />
</motion.div>
```

**Impact:**
- Mobile users must open menu to log in
- No visible auth status on mobile header
- Inconsistent experience across breakpoints

**Required Fix:**
- Add auth status indicator visible on mobile
- Or: Include login option in mobile hamburger area

---

### Issue 7: Menu Overlay Doesn't Show Logout Option (LOW)

**File:** `components/Navigation-header/MenuOverlay.tsx`

**Problem:** The menu shows "Admin" or "Profile" links when authenticated, but no direct "Log Out" option.

**Impact:**
- Users must navigate to Profile page to log out
- Extra steps for a common action

**Required Fix:**
- Add "Log Out" item to navigation when authenticated
- Handle logout inline in the menu

---

### Issue 8: URL Query Param for Login Not Consumed (LOW)

**File:** `components/Navigation-header/HeaderNav.tsx`

**Problem:** The profile page redirects with `?login=true` in the URL, but `HeaderNav` doesn't check for this to auto-open the login modal.

```tsx
// profile/page.tsx:25
router.push("/?login=true");  // Sets query param

// HeaderNav.tsx - Never checks for ?login=true
const [openLogin, setOpenLogin] = useState(false);  // Always starts false
```

**Impact:**
- Redirect to `/?login=true` doesn't actually open the login modal
- User must manually click "Log In"

**Required Fix:**
- Check for `?login=true` query param on mount
- Auto-open login modal if param is present
- Clear the param after opening modal

---

## Implementation Plan

### Phase 1: Critical Fixes (Must Fix)

1. **Fix React Hooks Violation in Login.tsx**
   - Move all hooks before conditional return
   - Test that component mounts/unmounts correctly

2. **Fix LogInButton to Show Auth Status**
   - Import useAuth hook
   - Conditionally render "Log In" or user info
   - Add user dropdown with Profile/Logout options

3. **Fix Redirect Logic After Login**
   - Move redirect handling outside Login component
   - Ensure redirects happen after profile is loaded
   - Close modal and redirect in correct sequence

### Phase 2: Important Fixes

4. **Handle Missing Profiles**
   - Add database trigger for auto-profile creation
   - OR: Create profile on first authenticated request
   - Remove confusing error message

5. **Add Login Query Param Handler**
   - Check for `?login=true` in HeaderNav
   - Auto-open modal when param present

### Phase 3: UX Improvements

6. **Add Loading States**
   - Show loading in header during auth
   - Add transition animations

7. **Add Logout to Menu Overlay**
   - Add "Log Out" navigation item
   - Handle inline logout

8. **Mobile Auth UI**
   - Add auth indicator to mobile header
   - Improve mobile login flow

---

## Files to Modify

| File | Changes Required | Priority |
|------|------------------|----------|
| `components/Login.tsx` | Fix hooks order, fix redirect logic | Critical |
| `components/Navigation-header/LogInButton.tsx` | Add auth state check, show user info | Critical |
| `components/Navigation-header/HeaderNav.tsx` | Add ?login=true handling, possibly move redirect logic here | Critical |
| `context/AuthContext.tsx` | Consider adding profile creation fallback | High |
| `components/Navigation-header/MenuOverlay.tsx` | Add logout option | Medium |
| Database (Supabase) | Add profile creation trigger | High |

---

## Testing Checklist

After implementation, verify:

- [ ] New user can sign up and is automatically given a profile
- [ ] Existing user can log in
- [ ] Login modal closes after successful login
- [ ] Header shows user email/name after login
- [ ] User is redirected to intended path after login
- [ ] Admin users are redirected to `/admin` after login
- [ ] Regular users are redirected to home or intended path
- [ ] Logout works from profile page
- [ ] Logout works from menu overlay (after fix)
- [ ] Mobile users can see auth status
- [ ] Protected routes redirect to login, then redirect back after auth
- [ ] `/?login=true` auto-opens the login modal
- [ ] No React hooks warnings in console
- [ ] Auth state persists on page refresh

---

## Success Criteria

1. Users can clearly see when they are logged in vs. logged out
2. Login modal closes and user is redirected appropriately
3. No console errors or React hooks violations
4. Auth flow works for both new signups and existing users
5. Works correctly on both desktop and mobile

---

## Appendix: Current Auth Flow Diagram

```
[User clicks "Log In"]
        ↓
[Login Modal Opens]
        ↓
[User enters credentials]
        ↓
[signIn() called in AuthContext]
        ↓
    Success? ─── No ──→ [Show error in modal]
        │
       Yes
        ↓
[setOpenLogin(false)] ← PROBLEM: Modal unmounts
        ↓
[onAuthStateChange SIGNED_IN event] (happens async)
        ↓
[fetchProfile() called]
        ↓
[Profile loaded into context]
        ↓
[Login component useEffect should redirect] ← PROBLEM: Component already unmounted!
        ↓
[User stuck on current page, no feedback]
```

**Fixed Flow:**

```
[User clicks "Log In"]
        ↓
[Login Modal Opens]
        ↓
[User enters credentials]
        ↓
[signIn() called in AuthContext]
        ↓
    Success? ─── No ──→ [Show error in modal]
        │
       Yes
        ↓
[Wait for profile to load (show loading state)]
        ↓
[Profile loaded]
        ↓
[Redirect to intended path / admin]
        ↓
[Close modal]
        ↓
[Header updates to show user info] ← Now correctly shows auth status
```
