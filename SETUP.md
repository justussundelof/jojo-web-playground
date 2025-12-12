# Setup Guide

## 1. Supabase Database Setup

### Products Table Fields

Your products table should have these fields:
- `id` (bigint)
- `created_at` (timestamp with time zone)
- `title` (text)
- `designer` (text)
- `size` (user-defined enum)
- `width` (text) - width of article in cm
- `height` (text) - height of article in cm
- `description` (text)
- `category` (user-defined enum)
- `tag` (user-defined enum)
- `price` (numeric)
- `in_stock` (boolean)
- `for_sale` (boolean)
- `image_url` (text) - **Add this column if it doesn't exist**

### Add image_url column (if needed)

If your table doesn't have the `image_url` column yet, run:

```sql
ALTER TABLE products ADD COLUMN image_url TEXT;
```

### Enable Row Level Security

```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can read products (for shop visitors)
CREATE POLICY "Allow public read access" ON products
  FOR SELECT
  USING (true);

-- Authenticated users can insert (admin)
CREATE POLICY "Allow authenticated insert" ON products
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update (admin)
CREATE POLICY "Allow authenticated update" ON products
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Authenticated users can delete (admin)
CREATE POLICY "Allow authenticated delete" ON products
  FOR DELETE
  USING (auth.role() = 'authenticated');
```

## 2. Create Admin User

In Supabase Dashboard → Authentication → Users:

1. Click "Add user"
2. Choose "Create user"
3. Enter email and password
4. Click "Create user"

## 3. Storage Bucket

Your `jojo-media` bucket should already be created with:
- ✅ Public read access (anon role, SELECT)
- ✅ Authenticated upload access (authenticated role, INSERT)

## 4. Environment Variables

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 5. Run the App

```bash
npm run dev
```

## 6. Login

Navigate to `http://localhost:3000/login` and use your admin credentials.

## Routes

- `/login` - Admin login
- `/admin` - Dashboard
- `/admin/products` - View all products
- `/admin/products/add` - Add new product with camera

## Storage Structure

Images are stored in Supabase Storage:

```
jojo-media/
└── shop/
    └── products/
        ├── product-1701234567890.jpg
        ├── product-1701234598234.jpg
        └── ...
```
