# Setup Guide

## 1. Supabase Database Setup

### Create Products Table

In your Supabase SQL Editor, run:

```sql
-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  category VARCHAR(100) NOT NULL,
  size VARCHAR(50) NOT NULL,
  color VARCHAR(100) NOT NULL,
  brand VARCHAR(100),
  condition VARCHAR(50),
  era VARCHAR(50),
  stock_quantity INTEGER NOT NULL DEFAULT 1 CHECK (stock_quantity >= 0),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
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
