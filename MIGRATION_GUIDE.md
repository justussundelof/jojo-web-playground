# Database Migration Guide

This guide will help you migrate from enum-based categories to a proper relational database structure with foreign keys.

## Overview

**What's changing:**
- Old: `category`, `tag`, `size` as enum columns
- New: `category_id`, `tag_id`, `size_id` as foreign keys to separate tables
- New hierarchical categories: Gender (Female/Male) → Category (Clothing, Bags & Accessories, Shoes)

## Migration Steps

### Step 1: Run the Initial Migration

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/001_create_categories.sql`
4. Paste it into the SQL Editor
5. Click **RUN**

This will:
- ✅ Create `categories`, `tags`, and `sizes` tables
- ✅ Add `category_id`, `tag_id`, `size_id` columns to `article` table
- ✅ Set up foreign key constraints
- ✅ Enable Row Level Security (RLS)
- ✅ Insert initial data:
  - **Genders**: Female, Male
  - **Categories**: Clothing, Bags & Accessories, Shoes (for each gender)
  - **Tags**: Y2K, Christmas, Summer, Grunge
  - **Sizes**: S, M, L

### Step 2: Migrate Existing Data (Optional)

If you have existing articles in your database:

1. Open `supabase/migrations/002_migrate_existing_data.sql`
2. Review the migration options:
   - **Option 1**: Set all `category_id` to NULL (you'll assign manually later)
   - **Option 2**: Map old enum values to new categories (requires manual editing)
3. Edit the SQL file to choose your preferred option
4. Run it in the SQL Editor

**Example for Option 2:**
```sql
-- Map old 'clothing' enum to 'Female > Clothing'
UPDATE article
SET category_id = (SELECT id FROM categories WHERE slug = 'female-clothing')
WHERE category = 'clothing';
```

### Step 3: Verify Migration

Run this query to check your data:

```sql
SELECT
  COUNT(*) as total_articles,
  COUNT(category_id) as with_category,
  COUNT(tag_id) as with_tag,
  COUNT(size_id) as with_size
FROM article;
```

### Step 4: Test the Application

1. Open your admin panel: `http://localhost:3000/admin/products/add`
2. Try creating a new product:
   - Select **Gender** (Female or Male)
   - The **Category** dropdown will populate based on the selected gender
   - Select **Tag** and **Size**
3. Submit the form and verify the product is created

### Step 5: Clean Up Old Columns (After Testing)

⚠️ **WARNING**: Only do this after you've verified everything works!

Once you're confident the new structure works:

1. Run `supabase/migrations/003_cleanup_old_columns.sql`
2. This will permanently delete the old `category`, `tag`, and `size` enum columns

## Database Structure

### New Hierarchy

```
categories (id, name, slug, parent_id)
├── Female (id: 1, parent_id: NULL)
│   ├── Clothing (id: 3, parent_id: 1)
│   ├── Bags & Accessories (id: 4, parent_id: 1)
│   └── Shoes (id: 5, parent_id: 1)
└── Male (id: 2, parent_id: NULL)
    ├── Clothing (id: 6, parent_id: 2)
    ├── Bags & Accessories (id: 7, parent_id: 2)
    └── Shoes (id: 8, parent_id: 2)
```

### Tables

**categories**
- `id` - Primary key
- `name` - Display name (e.g., "Female", "Clothing")
- `slug` - URL-friendly name (e.g., "female-clothing")
- `parent_id` - References parent category (NULL for top-level)

**tags**
- `id` - Primary key
- `name` - Display name (e.g., "Y2K")
- `slug` - URL-friendly name (e.g., "y2k")

**sizes**
- `id` - Primary key
- `name` - Display name (e.g., "S")
- `slug` - URL-friendly name (e.g., "s")
- `sort_order` - Order for display

**article** (updated)
- All existing columns remain
- `category_id` - Foreign key to categories
- `tag_id` - Foreign key to tags
- `size_id` - Foreign key to sizes

## Managing Categories, Tags, and Sizes

### Adding a New Category

**Add a new subcategory under Female:**
```sql
INSERT INTO categories (name, slug, parent_id) VALUES
  ('Jewelry', 'female-jewelry', (SELECT id FROM categories WHERE slug = 'female'));
```

**Add a new gender:**
```sql
-- 1. Add the gender
INSERT INTO categories (name, slug, parent_id) VALUES
  ('Unisex', 'unisex', NULL);

-- 2. Add subcategories
INSERT INTO categories (name, slug, parent_id) VALUES
  ('Clothing', 'unisex-clothing', (SELECT id FROM categories WHERE slug = 'unisex')),
  ('Accessories', 'unisex-accessories', (SELECT id FROM categories WHERE slug = 'unisex'));
```

### Adding a New Tag

```sql
INSERT INTO tags (name, slug) VALUES
  ('Vintage', 'vintage');
```

### Adding a New Size

```sql
INSERT INTO sizes (name, slug, sort_order) VALUES
  ('XS', 'xs', 0),  -- Will appear before S
  ('XL', 'xl', 4);  -- Will appear after L
```

## Querying Articles with Joined Data

To fetch articles with their full category, tag, and size names:

```sql
SELECT
  a.*,
  c.name as category_name,
  c.slug as category_slug,
  parent.name as gender_name,
  t.name as tag_name,
  s.name as size_name
FROM article a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN categories parent ON c.parent_id = parent.id
LEFT JOIN tags t ON a.tag_id = t.id
LEFT JOIN sizes s ON a.size_id = s.id;
```

## Rollback (Emergency)

If something goes wrong, you can rollback by:

1. Dropping the new tables:
```sql
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS sizes CASCADE;
```

2. Removing the foreign key columns:
```sql
ALTER TABLE article DROP COLUMN IF EXISTS category_id;
ALTER TABLE article DROP COLUMN IF EXISTS tag_id;
ALTER TABLE article DROP COLUMN IF EXISTS size_id;
```

3. Your old enum columns will still be intact (unless you ran step 5)

## Next Steps

After successful migration:
- [ ] Update `/admin/products` page to display joined category names
- [ ] Create admin pages for managing categories, tags, and sizes
- [ ] Add category filtering to the shop frontend
- [ ] Consider adding product images per category
