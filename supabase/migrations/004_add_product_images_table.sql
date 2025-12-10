-- Migration: Add product_images table for multiple image support
-- Date: 2025-12-10
-- Purpose: Support 1-8 images per product with ordering and primary image designation

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES article(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one primary image per product
CREATE UNIQUE INDEX idx_one_primary_per_product
ON product_images (article_id)
WHERE is_primary = TRUE;

-- Index for efficient queries by article
CREATE INDEX idx_product_images_article
ON product_images(article_id);

-- Index for ordering
CREATE INDEX idx_product_images_order
ON product_images(article_id, display_order);

-- Enable Row Level Security
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view product images
CREATE POLICY "Public read access for product_images"
ON product_images FOR SELECT
TO public
USING (true);

-- Authenticated users can insert product images
CREATE POLICY "Authenticated users can insert product_images"
ON product_images FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update product images
CREATE POLICY "Authenticated users can update product_images"
ON product_images FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated users can delete product images
CREATE POLICY "Authenticated users can delete product_images"
ON product_images FOR DELETE
TO authenticated
USING (true);

-- Migrate existing img_url data to product_images table
-- This will convert single images to the new multi-image structure
INSERT INTO product_images (article_id, image_url, display_order, is_primary)
SELECT
  id,
  img_url,
  0,
  TRUE
FROM article
WHERE img_url IS NOT NULL AND img_url != '';

-- Note: We keep the img_url column in article table for backward compatibility
-- It will be deprecated but not dropped to preserve historical data
-- Future queries should use product_images table instead
