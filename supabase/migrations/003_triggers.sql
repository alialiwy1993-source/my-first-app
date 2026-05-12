-- =====================================================
-- Migration 003: Triggers & Functions
-- =====================================================

-- =====================================================
-- 1. Auto-create profile عند تسجيل مستخدم جديد
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. Auto-update updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- تطبيق على profiles
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- تطبيق على studio_generations
DROP TRIGGER IF EXISTS generations_updated_at ON public.studio_generations;
CREATE TRIGGER generations_updated_at
  BEFORE UPDATE ON public.studio_generations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- تطبيق على conversations
DROP TRIGGER IF EXISTS conversations_updated_at ON public.conversations;
CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- تطبيق على research_projects
DROP TRIGGER IF EXISTS research_projects_updated_at ON public.research_projects;
CREATE TRIGGER research_projects_updated_at
  BEFORE UPDATE ON public.research_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- 3. تحديث updated_at للمحادثة عند إضافة رسالة جديدة
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS message_updates_conversation ON public.messages;
CREATE TRIGGER message_updates_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_on_message();

-- =====================================================
-- 4. زيادة usage_count عند كل توليد ناجح
-- =====================================================
CREATE OR REPLACE FUNCTION public.increment_usage_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.profiles
    SET usage_count = usage_count + 1
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS generation_increments_usage ON public.studio_generations;
CREATE TRIGGER generation_increments_usage
  AFTER INSERT OR UPDATE ON public.studio_generations
  FOR EACH ROW EXECUTE FUNCTION public.increment_usage_count();
