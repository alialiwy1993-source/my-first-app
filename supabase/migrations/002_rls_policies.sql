-- =====================================================
-- Migration 002: Row Level Security Policies
-- =====================================================

-- تفعيل RLS على كل الجداول
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studios           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_files        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_audio   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_videos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tools          ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- profiles
-- =====================================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- studios — قراءة للجميع، كتابة للأدمن فقط
-- =====================================================
CREATE POLICY "Anyone can view active studios"
  ON public.studios FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage studios"
  ON public.studios FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- studio_generations
-- =====================================================
CREATE POLICY "Users can view own generations"
  ON public.studio_generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations"
  ON public.studio_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations"
  ON public.studio_generations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generations"
  ON public.studio_generations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all generations"
  ON public.studio_generations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- conversations
-- =====================================================
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON public.conversations FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- messages
-- =====================================================
CREATE POLICY "Users can view messages of own conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages of own conversations"
  ON public.messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = messages.conversation_id AND user_id = auth.uid()
    )
  );

-- =====================================================
-- user_files
-- =====================================================
CREATE POLICY "Users can manage own files"
  ON public.user_files FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- generated_images
-- =====================================================
CREATE POLICY "Users can manage own images"
  ON public.generated_images FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- generated_audio
-- =====================================================
CREATE POLICY "Users can manage own audio"
  ON public.generated_audio FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- generated_videos
-- =====================================================
CREATE POLICY "Users can manage own videos"
  ON public.generated_videos FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- research_projects
-- =====================================================
CREATE POLICY "Users can manage own research projects"
  ON public.research_projects FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- research_sections
-- =====================================================
CREATE POLICY "Users can manage own research sections"
  ON public.research_sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.research_projects
      WHERE id = research_sections.project_id AND user_id = auth.uid()
    )
  );

-- =====================================================
-- user_usage
-- =====================================================
CREATE POLICY "Users can view own usage"
  ON public.user_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert usage"
  ON public.user_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage"
  ON public.user_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- ai_tools — قراءة للجميع
-- =====================================================
CREATE POLICY "Anyone can view active ai_tools"
  ON public.ai_tools FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage ai_tools"
  ON public.ai_tools FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
