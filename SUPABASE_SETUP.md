# Supabase Database Setup

This document explains how to set up the `articles` table in your Supabase database.

## Creating the Articles Table

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project
3. Go to the **SQL Editor** (left sidebar)
4. Run the following SQL query:

```sql
-- Create articles table
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  category VARCHAR(100) NOT NULL,
  size VARCHAR(50) NOT NULL,
  color VARCHAR(100) NOT NULL,
  material VARCHAR(100),
  brand VARCHAR(100),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on category for faster filtering
CREATE INDEX idx_articles_category ON articles(category);

-- Create an index on is_featured for faster homepage queries
CREATE INDEX idx_articles_featured ON articles(is_featured);

-- Create an index on created_at for sorting
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before each update
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Row Level Security (RLS) - Optional but Recommended

If you want to add Row Level Security for better data protection:

```sql
-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for customers browsing the store)
CREATE POLICY "Allow public read access" ON articles
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert (for admin)
CREATE POLICY "Allow authenticated insert" ON articles
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update (for admin)
CREATE POLICY "Allow authenticated update" ON articles
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete (for admin)
CREATE POLICY "Allow authenticated delete" ON articles
  FOR DELETE
  USING (auth.role() = 'authenticated');
```

## Verifying the Setup

After running the SQL commands, verify the table was created:

1. Go to **Table Editor** in the Supabase dashboard
2. You should see the `articles` table listed
3. Check that all columns are present

## Database Schema Overview

| Column         | Type        | Nullable | Default         | Description                      |
|----------------|-------------|----------|-----------------|----------------------------------|
| id             | UUID        | No       | Auto-generated  | Primary key                      |
| title          | VARCHAR     | No       | -               | Article name                     |
| description    | TEXT        | No       | -               | Detailed description             |
| price          | DECIMAL     | No       | -               | Price in dollars                 |
| category       | VARCHAR     | No       | -               | Product category                 |
| size           | VARCHAR     | No       | -               | Size (XS, S, M, L, XL, etc.)    |
| color          | VARCHAR     | No       | -               | Color description                |
| material       | VARCHAR     | Yes      | NULL            | Material type (Cotton, Silk, etc)|
| brand          | VARCHAR     | Yes      | NULL            | Brand name                       |
| stock_quantity | INTEGER     | No       | 0               | Available stock                  |
| image_url      | TEXT        | Yes      | NULL            | Product image URL                |
| is_featured    | BOOLEAN     | No       | false           | Featured on homepage?            |
| created_at     | TIMESTAMP   | No       | NOW()           | Creation timestamp               |
| updated_at     | TIMESTAMP   | No       | NOW()           | Last update timestamp            |

## Testing the Setup

You can test by inserting a sample article:

```sql
INSERT INTO articles (
  title,
  description,
  price,
  category,
  size,
  color,
  stock_quantity,
  is_featured
) VALUES (
  'Sample Summer Dress',
  'Beautiful floral dress perfect for summer',
  49.99,
  'Clothing',
  'M',
  'Blue',
  10,
  true
);
```

## Accessing the Admin Page

Once the database is set up, you can access the admin page at:

```
http://localhost:3000/admin/articles/create
```

Make sure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```
