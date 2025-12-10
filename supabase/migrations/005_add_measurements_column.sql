-- Migration: Add measurements JSONB column to article table
-- Date: 2025-12-10
-- Purpose: Support flexible product measurements for different clothing types

-- Add measurements column as JSONB for flexibility
ALTER TABLE article
ADD COLUMN IF NOT EXISTS measurements JSONB DEFAULT '{}';

-- Create GIN index for efficient JSON queries
CREATE INDEX IF NOT EXISTS idx_article_measurements
ON article USING GIN (measurements);

-- Add comment to document the measurements structure
COMMENT ON COLUMN article.measurements IS
'Flexible measurements storage for clothing items. Structure varies by category:

Jacka, Tröja, Topp, Blus, Skjorta (Tops):
{
  "shoulder_width": 42,    -- Axel till axel (cm)
  "chest_width": 52,        -- Armhåla till armhåla / bröstbredd (cm)
  "sleeve_length": 64,      -- Ärmlängd från axelsöm (cm)
  "garment_length": 68      -- Plagglängd från axel till nederkant (cm)
}

Byxor (Pants):
{
  "waist_width": 40,        -- Midjebredd liggande (cm)
  "hip_width": 50,          -- Höftbredd (cm)
  "inseam": 75,             -- Innerbenslängd (cm)
  "outseam": 100,           -- Ytterbenslängd (cm)
  "rise": 28,               -- Grenhöjd (cm)
  "leg_opening": 18         -- Benslut / vidd nertill (cm)
}

Kjol (Skirt):
{
  "waist_width": 38,        -- Midjebredd (cm)
  "garment_length": 60      -- Längd (cm)
}

Klänning (Dress):
{
  "shoulder_width": 40,     -- Axel till axel (cm)
  "chest_width": 48,        -- Armhåla till armhåla (cm)
  "waist_width": 38,        -- Midjebredd (cm)
  "hip_width": 50,          -- Höftbredd (cm)
  "garment_length": 90,     -- Plagglängd (cm)
  "sleeve_length": 60,      -- Ärmlängd (optional) (cm)
  "slit_length": 20         -- Slits (optional) (cm)
}

All measurements in centimeters (cm).
';
