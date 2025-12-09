-- ============================================
-- Migrate Existing Data from Enums to Foreign Keys
-- ============================================
-- This script migrates data from the old enum columns
-- (category, tag, size) to the new foreign key columns
-- (category_id, tag_id, size_id)
-- ============================================

-- Migrate category data
-- Note: Old enum had simple values like 'clothing', 'bags', 'accessories', 'shoes'
-- Since we don't have gender info in old data, we'll need to manually assign or leave NULL

-- Option 1: Set all existing articles to NULL (manual assignment later)
-- This is safest if you don't know the gender of existing articles
UPDATE article SET category_id = NULL WHERE category_id IS NULL;

-- Option 2: If you want to migrate old 'clothing' to 'Female > Clothing' by default:
-- UPDATE article
-- SET category_id = (SELECT id FROM categories WHERE slug = 'female-clothing')
-- WHERE category = 'clothing';

-- Migrate tag data
UPDATE article
SET tag_id = (SELECT id FROM tags WHERE slug = article.tag)
WHERE article.tag IS NOT NULL;

-- Migrate size data
UPDATE article
SET size_id = (SELECT id FROM sizes WHERE slug = article.size)
WHERE article.size IS NOT NULL;

-- Verify migration
-- Check how many articles have been migrated
SELECT
  COUNT(*) as total_articles,
  COUNT(category_id) as with_category,
  COUNT(tag_id) as with_tag,
  COUNT(size_id) as with_size
FROM article;
