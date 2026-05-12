-- =====================================================
-- Migration 004: Storage Buckets
-- =====================================================
-- ملاحظة: هذه الـ SQL تعمل مع Supabase Storage API
-- يمكن تشغيلها من SQL Editor في Supabase Dashboard

-- إنشاء bucket للملفات المرفوعة من المستخدمين
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-uploads',
  'user-uploads',
  FALSE,
  10485760, -- 10MB
  ARRAY['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- إنشاء bucket للصور المولّدة
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'generated-images',
  'generated-images',
  FALSE,
  10485760 -- 10MB
)
ON CONFLICT (id) DO NOTHING;

-- إنشاء bucket للصوت المولّد
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'generated-audio',
  'generated-audio',
  FALSE,
  52428800 -- 50MB
)
ON CONFLICT (id) DO NOTHING;

-- إنشاء bucket للفيديوهات المولّدة
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'generated-videos',
  'generated-videos',
  FALSE,
  524288000 -- 500MB
)
ON CONFLICT (id) DO NOTHING;

-- إنشاء bucket للصور الشخصية (عام)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Storage RLS Policies
-- =====================================================

-- user-uploads: المستخدم يرفع لمجلده فقط
CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own uploads"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'user-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- generated-images: المستخدم يرى صوره فقط
CREATE POLICY "Users can access own images"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'generated-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- generated-audio: المستخدم يرى ملفاته الصوتية فقط
CREATE POLICY "Users can access own audio"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'generated-audio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- generated-videos: المستخدم يرى فيديوهاته فقط
CREATE POLICY "Users can access own videos"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'generated-videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- avatars: عام للقراءة، كل مستخدم يرفع لمجلده
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
