-- =====================================================
-- Migration 001: Initial Schema
-- AI Universal Assistant — AI Studio Platform
-- =====================================================

-- تفعيل extensions المطلوبة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- للبحث النصي

-- =====================================================
-- 1. profiles — ملحق بـ auth.users من Supabase
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT NOT NULL,
  full_name             TEXT,
  avatar_url            TEXT,
  role                  TEXT NOT NULL DEFAULT 'user'
                          CHECK (role IN ('user', 'admin')),
  -- حقول الاشتراكات (جاهزة للمستقبل)
  plan                  TEXT NOT NULL DEFAULT 'free'
                          CHECK (plan IN ('free', 'pro', 'enterprise')),
  usage_limit           INT NOT NULL DEFAULT 100,
  usage_count           INT NOT NULL DEFAULT 0,
  subscription_status   TEXT NOT NULL DEFAULT 'active'
                          CHECK (subscription_status IN ('active', 'canceled', 'expired', 'trialing')),
  subscription_end      TIMESTAMPTZ,
  -- إعدادات المستخدم
  preferred_model       TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  preferred_theme       TEXT NOT NULL DEFAULT 'dark'
                          CHECK (preferred_theme IN ('dark', 'light')),
  preferred_language    TEXT NOT NULL DEFAULT 'ar',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role  ON public.profiles(role);

-- =====================================================
-- 2. studios — كتالوج الاستوديوهات
-- =====================================================
CREATE TABLE IF NOT EXISTS public.studios (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  TEXT UNIQUE NOT NULL,
  name_ar               TEXT NOT NULL,
  name_en               TEXT,
  description_ar        TEXT,
  category              TEXT NOT NULL DEFAULT 'text'
                          CHECK (category IN ('text', 'image', 'audio', 'video', 'research')),
  icon                  TEXT,
  color                 TEXT,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  is_premium            BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order            INT NOT NULL DEFAULT 0,
  config                JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_studios_slug     ON public.studios(slug);
CREATE INDEX IF NOT EXISTS idx_studios_active   ON public.studios(is_active);

-- =====================================================
-- 3. studio_generations — الجدول المركزي لكل التوليدات
-- =====================================================
CREATE TABLE IF NOT EXISTS public.studio_generations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  studio_slug           TEXT NOT NULL,
  -- المدخلات والنتيجة
  prompt                TEXT,
  input                 JSONB,
  output                TEXT,
  output_format         TEXT NOT NULL DEFAULT 'text'
                          CHECK (output_format IN ('text', 'markdown', 'json', 'html')),
  -- الوسائط (إن وُجدت)
  image_url             TEXT,
  audio_url             TEXT,
  video_url             TEXT,
  file_url              TEXT,
  -- metadata تقنية
  model                 TEXT,
  tokens_used           INT NOT NULL DEFAULT 0,
  cost_cents            INT NOT NULL DEFAULT 0,
  duration_ms           INT,
  metadata              JSONB,
  -- الحالة والتنظيم
  status                TEXT NOT NULL DEFAULT 'completed'
                          CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message         TEXT,
  is_favorite           BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived           BOOLEAN NOT NULL DEFAULT FALSE,
  title                 TEXT,
  tags                  TEXT[],
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generations_user_studio
  ON public.studio_generations(user_id, studio_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_user_date
  ON public.studio_generations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_favorite
  ON public.studio_generations(user_id, is_favorite)
  WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_generations_status
  ON public.studio_generations(status);

-- =====================================================
-- 4. conversations — استوديو المحادثة
-- =====================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title                 TEXT NOT NULL DEFAULT 'محادثة جديدة',
  assistant_type        TEXT NOT NULL DEFAULT 'general'
                          CHECK (assistant_type IN ('general','coder','business','study','writing','marketing')),
  model                 TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  is_pinned             BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id
  ON public.conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_pinned
  ON public.conversations(user_id, is_pinned)
  WHERE is_pinned = TRUE;

-- =====================================================
-- 5. messages — رسائل المحادثات
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id       UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role                  TEXT NOT NULL
                          CHECK (role IN ('user', 'assistant', 'system')),
  content               TEXT NOT NULL,
  tokens_used           INT NOT NULL DEFAULT 0,
  model                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON public.messages(conversation_id, created_at ASC);

-- =====================================================
-- 6. user_files — الملفات المرفوعة
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_files (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  generation_id         UUID REFERENCES public.studio_generations(id) ON DELETE SET NULL,
  file_name             TEXT NOT NULL,
  file_path             TEXT NOT NULL,
  file_size             BIGINT,
  mime_type             TEXT,
  extracted_text        TEXT,
  summary               TEXT,
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'processing', 'ready', 'failed')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_files_user_id ON public.user_files(user_id);

-- =====================================================
-- 7. generated_images — استوديو الصور
-- =====================================================
CREATE TABLE IF NOT EXISTS public.generated_images (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  generation_id         UUID REFERENCES public.studio_generations(id) ON DELETE SET NULL,
  prompt                TEXT NOT NULL,
  negative_prompt       TEXT,
  style                 TEXT,
  size                  TEXT,
  model                 TEXT,
  image_url             TEXT NOT NULL,
  storage_path          TEXT,
  thumbnail_url         TEXT,
  is_favorite           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_images_user_id ON public.generated_images(user_id, created_at DESC);

-- =====================================================
-- 8. generated_audio — استوديو الصوت
-- =====================================================
CREATE TABLE IF NOT EXISTS public.generated_audio (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  generation_id         UUID REFERENCES public.studio_generations(id) ON DELETE SET NULL,
  text_input            TEXT NOT NULL,
  voice                 TEXT,
  language              TEXT NOT NULL DEFAULT 'ar',
  model                 TEXT,
  audio_url             TEXT NOT NULL,
  storage_path          TEXT,
  duration_seconds      NUMERIC,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audio_user_id ON public.generated_audio(user_id, created_at DESC);

-- =====================================================
-- 9. generated_videos — استوديو الفيديو
-- =====================================================
CREATE TABLE IF NOT EXISTS public.generated_videos (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  generation_id         UUID REFERENCES public.studio_generations(id) ON DELETE SET NULL,
  prompt                TEXT NOT NULL,
  video_url             TEXT,
  storage_path          TEXT,
  provider              TEXT,
  status                TEXT NOT NULL DEFAULT 'pending',
  duration_seconds      NUMERIC,
  metadata              JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_user_id ON public.generated_videos(user_id, created_at DESC);

-- =====================================================
-- 10. research_projects — استوديو الأبحاث
-- =====================================================
CREATE TABLE IF NOT EXISTS public.research_projects (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title                 TEXT NOT NULL,
  level                 TEXT CHECK (level IN ('bachelor', 'master', 'phd', 'other')),
  field                 TEXT,
  language              TEXT NOT NULL DEFAULT 'ar',
  description           TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.research_sections (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id            UUID NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
  section_type          TEXT NOT NULL,
  content               TEXT,
  sort_order            INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_user   ON public.research_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_sections_project ON public.research_sections(project_id);

-- =====================================================
-- 11. user_usage — تتبع الاستخدام اليومي
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_usage (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  studio_slug           TEXT,
  action                TEXT NOT NULL,
  tokens_used           INT NOT NULL DEFAULT 0,
  cost_cents            INT NOT NULL DEFAULT 0,
  metadata              JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_user_date
  ON public.user_usage(user_id, created_at DESC);

-- =====================================================
-- 12. ai_tools — دليل أدوات AI الخارجية
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_tools (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  url                   TEXT NOT NULL,
  description_ar        TEXT,
  category              TEXT,
  tags                  TEXT[],
  is_free               BOOLEAN NOT NULL DEFAULT FALSE,
  logo_url              TEXT,
  sort_order            INT NOT NULL DEFAULT 0,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_tools_category ON public.ai_tools(category);
