-- =====================================================
-- Migration 007: Enhance generated_audio + generated_videos
-- Adds missing columns needed for M4
-- =====================================================

-- ── generated_audio ──────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='generated_audio' AND column_name='speed')
  THEN ALTER TABLE public.generated_audio ADD COLUMN speed NUMERIC DEFAULT 1.0; END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='generated_audio' AND column_name='metadata')
  THEN ALTER TABLE public.generated_audio ADD COLUMN metadata JSONB; END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='generated_audio' AND column_name='status')
  THEN ALTER TABLE public.generated_audio ADD COLUMN status TEXT DEFAULT 'completed'; END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='generated_audio' AND column_name='file_size')
  THEN ALTER TABLE public.generated_audio ADD COLUMN file_size BIGINT; END IF;
END $$;

-- ── generated_videos ─────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='generated_videos' AND column_name='platform')
  THEN ALTER TABLE public.generated_videos ADD COLUMN platform TEXT; END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='generated_videos' AND column_name='video_type')
  THEN ALTER TABLE public.generated_videos ADD COLUMN video_type TEXT; END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='generated_videos' AND column_name='script')
  THEN ALTER TABLE public.generated_videos ADD COLUMN script TEXT; END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='generated_videos' AND column_name='scenes')
  THEN ALTER TABLE public.generated_videos ADD COLUMN scenes JSONB; END IF;
END $$;

-- ── Storage: generated-audio bucket ──────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('generated-audio', 'generated-audio', FALSE, 52428800,
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'])
ON CONFLICT (id) DO NOTHING;

-- NOTE: Storage RLS policy for generated-audio is already created in migration 004.
-- The bucket insert above (ON CONFLICT DO NOTHING) is safe to re-run.
-- No additional policy needed here.
