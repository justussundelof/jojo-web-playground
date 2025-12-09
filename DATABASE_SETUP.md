# Database Setup - Quick Start

## Step-by-Step Instructions

### 1. Go to Supabase SQL Editor

1. Open your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### 2. Run Migration Script

Copy and paste the entire contents of `/supabase/migrations/001_create_categories.sql` into the SQL Editor and click **RUN**.

This creates:
- ✅ `categories` table (hierarchical: Gender → Product Type)
- ✅ `tags` table
- ✅ `sizes` table
- ✅ Foreign key columns in `article` table
- ✅ Initial data (Female/Male, Clothing/Bags/Shoes, Tags, Sizes)
- ✅ Row Level Security policies

### 3. Verify Tables Were Created

Run this query to check:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('categories', 'tags', 'sizes');
```

You should see all 3 tables listed.

### 4. Check Initial Data

```sql
-- View categories (should show Female/Male and their subcategories)
SELECT id, name, slug, parent_id FROM categories ORDER BY parent_id NULLS FIRST, name;

-- View tags
SELECT * FROM tags;

-- View sizes
SELECT * FROM sizes ORDER BY sort_order;
```

### 5. Test Your Application

1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000/admin/products/add`
3. Try creating a product:
   - Select a **Gender** (Female or Male)
   - Select a **Category** (Clothing, Bags & Accessories, or Shoes)
   - Select a **Tag** and **Size**
   - Take a photo
   - Fill in other details
   - Click **CREATE PRODUCT**

### 6. View Your Products

Go to `http://localhost:3000/admin/products` to see all products with their categories, tags, and sizes displayed.

## What Was Changed

### Database Structure

**Before:**
```
article table with enum columns:
- category (enum: 'accessories', 'bags', 'clothing', 'shoes')
- tag (enum: 'y2k', 'christmas', 'summer', 'grunge')
- size (enum: 's', 'm', 'l')
```

**After:**
```
article table with foreign keys:
- category_id → categories.id
- tag_id → tags.id
- size_id → sizes.id

categories table (hierarchical):
├── Female (parent_id: NULL)
│   ├── Clothing (parent_id: Female.id)
│   ├── Bags & Accessories (parent_id: Female.id)
│   └── Shoes (parent_id: Female.id)
└── Male (parent_id: NULL)
    ├── Clothing (parent_id: Male.id)
    ├── Bags & Accessories (parent_id: Male.id)
    └── Shoes (parent_id: Male.id)
```

### Application Changes

**Updated Files:**
- `/app/admin/products/add/page.tsx` - Now fetches categories/tags/sizes dynamically
- `/app/admin/products/page.tsx` - Shows joined category/tag/size data
- `/types/database.ts` - New TypeScript types
- `/types/product.ts` - Updated to use new types

## Managing Your Data

### Add a New Tag

```sql
INSERT INTO tags (name, slug) VALUES
  ('Vintage', 'vintage');
```

### Add a New Size

```sql
INSERT INTO sizes (name, slug, sort_order) VALUES
  ('XL', 'xl', 4);
```

### Add a New Category Under Female

```sql
INSERT INTO categories (name, slug, parent_id) VALUES
  ('Jewelry', 'female-jewelry', (SELECT id FROM categories WHERE slug = 'female'));
```

### Add a New Top-Level Gender

```sql
-- Add gender
INSERT INTO categories (name, slug, parent_id) VALUES
  ('Unisex', 'unisex', NULL);

-- Add subcategories for this gender
INSERT INTO categories (name, slug, parent_id) VALUES
  ('Clothing', 'unisex-clothing', (SELECT id FROM categories WHERE slug = 'unisex')),
  ('Accessories', 'unisex-accessories', (SELECT id FROM categories WHERE slug = 'unisex'));
```

## Migration for Existing Data

If you already have products in your database with the old enum values:

1. Run `/supabase/migrations/002_migrate_existing_data.sql`
2. This will migrate `tag` and `size` enum values to the new foreign keys
3. For `category`, you'll need to manually assign because the new structure includes gender

**Example manual assignment:**
```sql
-- Update all articles with old 'clothing' enum to 'Female > Clothing'
UPDATE article
SET category_id = (SELECT id FROM categories WHERE slug = 'female-clothing')
WHERE category = 'clothing' AND category_id IS NULL;
```

## Cleanup (Optional)

After verifying everything works, remove the old enum columns:

```sql
-- ⚠️ Only run this after testing!
ALTER TABLE article DROP COLUMN IF EXISTS category;
ALTER TABLE article DROP COLUMN IF EXISTS tag;
ALTER TABLE article DROP COLUMN IF EXISTS size;
```

## Troubleshooting

### Error: "relation 'categories' does not exist"

→ Run `/supabase/migrations/001_create_categories.sql` first

### Categories dropdown is empty

→ Check that initial data was inserted:
```sql
SELECT * FROM categories;
```

### Can't create product - "violates foreign key constraint"

→ Make sure you've selected valid options for Gender, Category, Tag, and Size

### Products page shows no category/tag/size

→ Make sure the foreign key columns are populated:
```sql
SELECT id, title, category_id, tag_id, size_id FROM article;
```

## Need Help?

Check the detailed guide: `/MIGRATION_GUIDE.md`
