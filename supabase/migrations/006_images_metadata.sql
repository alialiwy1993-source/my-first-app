-- =====================================================
-- Migration 006: Enhance generated_images for M3
-- Adds metadata column + revised_prompt if not exists
-- =====================================================

-- Add metadata column if missing (safe to run multiple times)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'generated_images'
      AND column_name = 'metadata'
  ) THEN
    ALTER TABLE public.generated_images ADD COLUMN metadata JSONB;
  END IF;
END $$;

-- Add quality column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'generated_images'
      AND column_name = 'quality'
  ) THEN
    ALTER TABLE public.generated_images ADD COLUMN quality TEXT DEFAULT 'standard';
  END IF;
END $$;

-- Additional index for favorites
CREATE INDEX IF NOT EXISTS idx_images_favorite
  ON public.generated_images(user_id, is_favorite)
  WHERE is_favorite = TRUE;

-- Additional index for style filtering
CREATE INDEX IF NOT EXISTS idx_images_style
  ON public.generated_images(user_id, style);

-- =====================================================
-- Storage bucket for images (if not created by migration 004)
-- =====================================================
-- Note: Run this only once. If bucket already exists it will be skipped.
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('generated-images', 'generated-images', FALSE, 10485760)
ON CONFLICT (id) DO NOTHING;
