# User Roles System

This document explains how the user roles system works in this application.

## Overview

The application supports two types of users:
- **Regular Users** (`user`): Can browse products, add to cart, and make purchases
- **Admin Users** (`admin`): Have full access to the admin dashboard and product management

## Database Structure

### Profiles Table

The `profiles` table stores user role information:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### User Roles Enum

```sql
CREATE TYPE user_role AS ENUM ('user', 'admin');
```

## Setting Up the Database

1. Run the migration to create the profiles table and role system:
   ```bash
   # If using Supabase locally
   supabase migration up

   # Or apply the SQL migration in Supabase dashboard
   # File: supabase/migrations/006_add_user_profiles_and_roles.sql
   ```

2. The migration automatically:
   - Creates the `profiles` table
   - Sets up Row Level Security (RLS) policies
   - Creates a trigger to auto-create profiles for new users
   - New users get the `user` role by default

## Making a User an Admin

To promote a user to admin, you need to update their profile in the database:

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Table Editor → profiles
3. Find the user by email
4. Edit the row and change `role` from `user` to `admin`
5. Save changes

### Option 2: Using SQL

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@example.com';
```

### Option 3: Using API (requires admin access)

```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({ role: 'admin' })
  .eq('email', 'admin@example.com');
```

## Using Roles in Your Code

### In Client Components

```typescript
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/hooks/useRole';

function MyComponent() {
  // Option 1: Use AuthContext directly
  const { isAdmin, role } = useAuth();

  // Option 2: Use the useRole hook
  const { isAdmin, isUser, hasRole } = useRole();

  if (isAdmin) {
    return <AdminPanel />;
  }

  return <UserPanel />;
}
```

### In Server Components

```typescript
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function MyPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Handle unauthenticated user
    return;
  }

  // Fetch user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'admin') {
    // Show admin content
  } else {
    // Show regular user content
  }
}
```

## Route Protection

### Automatic Protection

The middleware automatically protects admin routes:

- All routes under `/admin/*` are protected
- Users must be authenticated
- Users must have the `admin` role
- Non-admin users are redirected to the home page

### Manual Protection

You can also add role checks in individual pages:

```typescript
// In a page component
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (profile?.role !== 'admin') {
  redirect('/');
}
```

## Login Flow

When users log in:

1. User submits credentials
2. Supabase authenticates the user
3. System fetches the user's profile (including role)
4. User is redirected based on role:
   - **Admin users** → `/admin` (admin dashboard)
   - **Regular users** → `/` (home page)

## API Reference

### AuthContext

```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
```

### useRole Hook

```typescript
interface UseRoleReturn {
  role: UserRole | null;
  isAdmin: boolean;
  loading: boolean;
  hasRole: (requiredRole: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isUser: boolean;
}
```

## Security Considerations

1. **Row Level Security (RLS)**: The profiles table has RLS enabled
2. **Server-side Validation**: Always validate roles on the server
3. **Middleware Protection**: Admin routes are protected by middleware
4. **Default Role**: New users get the `user` role by default
5. **Role Updates**: Users cannot update their own role (protected by RLS)

## Testing

### Create Test Users

1. **Regular User**:
   ```typescript
   await supabase.auth.signUp({
     email: 'user@test.com',
     password: 'password123'
   });
   // Automatically gets 'user' role
   ```

2. **Admin User**:
   ```typescript
   // First create the user
   await supabase.auth.signUp({
     email: 'admin@test.com',
     password: 'password123'
   });

   // Then manually update role to 'admin' in database
   ```

## Troubleshooting

### User doesn't have a profile

If a user doesn't have a profile entry, it means:
- The trigger didn't fire (check trigger is enabled)
- The user was created before the migration

**Solution**: Manually create the profile:

```sql
INSERT INTO profiles (id, email, role)
VALUES (
  'user-uuid-here',
  'user@example.com',
  'user'
);
```

### Admin redirected from /admin

Check:
1. User is authenticated
2. Profile exists in the database
3. Profile role is set to 'admin' (not 'user')
4. RLS policies are correctly set up

### Role not updating after change

- Client-side: The AuthContext automatically updates when auth state changes
- If stuck: Sign out and sign back in to refresh the session