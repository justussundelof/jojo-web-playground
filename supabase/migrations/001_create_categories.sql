-- ============================================
-- JOJO Shop Database Structure
-- Hierarchical Categories with Genders
-- ============================================

-- 1. Create categories table with hierarchy support
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, parent_id)
);

-- 2. Create tags table
CREATE TABLE tags (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create sizes table
CREATE TABLE sizes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Insert Initial Data
-- ============================================

-- Insert top-level categories (Genders)
INSERT INTO categories (name, slug, parent_id) VALUES
  ('Female', 'female', NULL),
  ('Male', 'male', NULL);

-- Insert second-level categories (Product Types)
-- Female subcategories
INSERT INTO categories (name, slug, parent_id) VALUES
  ('Clothing', 'female-clothing', (SELECT id FROM categories WHERE slug = 'female')),
  ('Bags & Accessories', 'female-bags-accessories', (SELECT id FROM categories WHERE slug = 'female')),
  ('Shoes', 'female-shoes', (SELECT id FROM categories WHERE slug = 'female'));

-- Male subcategories
INSERT INTO categories (name, slug, parent_id) VALUES
  ('Clothing', 'male-clothing', (SELECT id FROM categories WHERE slug = 'male')),
  ('Bags & Accessories', 'male-bags-accessories', (SELECT id FROM categories WHERE slug = 'male')),
  ('Shoes', 'male-shoes', (SELECT id FROM categories WHERE slug = 'male'));

-- Insert tags (from your existing enum values)
INSERT INTO tags (name, slug) VALUES
  ('Y2K', 'y2k'),
  ('Christmas', 'christmas'),
  ('Summer', 'summer'),
  ('Grunge', 'grunge');

-- Insert sizes (from your existing enum values)
INSERT INTO sizes (name, slug, sort_order) VALUES
  ('S', 's', 1),
  ('M', 'm', 2),
  ('L', 'l', 3);

-- ============================================
-- Add Foreign Keys to article table
-- ============================================

-- Add new columns for foreign key relationships
ALTER TABLE article ADD COLUMN category_id BIGINT;
ALTER TABLE article ADD COLUMN tag_id BIGINT;
ALTER TABLE article ADD COLUMN size_id BIGINT;

-- Add foreign key constraints
ALTER TABLE article
  ADD CONSTRAINT fk_article_category
  FOREIGN KEY (category_id)
  REFERENCES categories(id)
  ON DELETE SET NULL;

ALTER TABLE article
  ADD CONSTRAINT fk_article_tag
  FOREIGN KEY (tag_id)
  REFERENCES tags(id)
  ON DELETE SET NULL;

ALTER TABLE article
  ADD CONSTRAINT fk_article_size
  FOREIGN KEY (size_id)
  REFERENCES sizes(id)
  ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_article_category_id ON article(category_id);
CREATE INDEX idx_article_tag_id ON article(tag_id);
CREATE INDEX idx_article_size_id ON article(size_id);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

-- ============================================
-- Enable RLS for new tables
-- ============================================

-- Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to categories" ON categories
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert on categories" ON categories
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update on categories" ON categories
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete on categories" ON categories
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Enable RLS on tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to tags" ON tags
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert on tags" ON tags
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update on tags" ON tags
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete on tags" ON tags
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Enable RLS on sizes
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to sizes" ON sizes
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert on sizes" ON sizes
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update on sizes" ON sizes
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete on sizes" ON sizes
  FOR DELETE
  USING (auth.role() = 'authenticated');
