-- ============================================
-- Cleanup Old Enum Columns
-- ============================================
-- ⚠️ WARNING: Only run this AFTER verifying that:
-- 1. All data has been migrated successfully
-- 2. The new foreign key relationships are working
-- 3. Your application code has been updated
-- ============================================

-- Remove old enum columns from article table
ALTER TABLE article DROP COLUMN IF EXISTS category;
ALTER TABLE article DROP COLUMN IF EXISTS tag;
ALTER TABLE article DROP COLUMN IF EXISTS size;

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'article'
ORDER BY ordinal_position;
