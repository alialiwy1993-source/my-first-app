# 📋 دليل إعداد Supabase — خطوة بخطوة

## المتطلبات
- حساب مجاني على [supabase.com](https://supabase.com)
- ملف `.env.local` في جذر المشروع

---

## الخطوة 1: إنشاء مشروع Supabase

1. اذهب إلى [app.supabase.com](https://app.supabase.com)
2. اضغط **New Project**
3. اختر:
   - **Organization**: حسابك أو مؤسستك
   - **Project Name**: `ai-universal-assistant`
   - **Database Password**: كلمة مرور قوية (احفظها)
   - **Region**: أقرب منطقة لمستخدميك
4. اضغط **Create New Project** وانتظر ~60 ثانية

---

## الخطوة 2: جلب مفاتيح الاتصال

1. من القائمة الجانبية → **Settings** → **API**
2. انسخ:
   ```
   Project URL     → NEXT_PUBLIC_SUPABASE_URL
   anon key        → NEXT_PUBLIC_SUPABASE_ANON_KEY
   service_role    → SUPABASE_SERVICE_ROLE_KEY
   ```

في ملف `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **تحذير**: `SUPABASE_SERVICE_ROLE_KEY` سري جداً — لا تضعه في الـ client-side أبداً.

---

## الخطوة 3: تشغيل Migrations (بالترتيب)

> شغّل كل migration من **SQL Editor** في Supabase Dashboard:
> اضغط **New Query** → انسخ المحتوى → اضغط **Run**

| # | الملف | المحتوى | مطلوب |
|---|-------|---------|-------|
| 001 | `001_init_schema.sql` | كل الجداول الأساسية (12 جدول) | ✅ |
| 002 | `002_rls_policies.sql` | سياسات الأمان RLS | ✅ |
| 003 | `003_triggers.sql` | Triggers (auto-create profile, updated_at, usage_count) | ✅ |
| 004 | `004_storage_buckets.sql` | Storage buckets + policies | ✅ |
| 005 | `005_seed_studios.sql` | بيانات الاستوديوهات وأدوات AI الأولية | ✅ |
| 006 | `006_images_metadata.sql` | أعمدة إضافية لـ generated_images (M3) | ✅ |
| 007 | `007_audio_video_enhance.sql` | أعمدة إضافية لـ generated_audio + generated_videos (M4) | ✅ |

### Migration 001 — الجداول الأساسية
```
supabase/migrations/001_init_schema.sql
```
ينشئ الجداول: `profiles`, `studios`, `studio_generations`, `conversations`, `messages`,
`user_files`, `generated_images`, `generated_audio`, `generated_videos`,
`research_projects`, `research_sections`, `user_usage`, `ai_tools`

### Migration 002 — سياسات RLS
```
supabase/migrations/002_rls_policies.sql
```
يفعّل Row Level Security على جميع الجداول ويُنشئ policies (المستخدم يرى بياناته فقط).

### Migration 003 — Triggers
```
supabase/migrations/003_triggers.sql
```
- `handle_new_user`: ينشئ profile تلقائياً عند تسجيل مستخدم جديد
- `update_updated_at`: يُحدّث `updated_at` عند كل تعديل
- `increment_usage_count`: يزيد عدّاد الاستخدام عند كل توليد

### Migration 004 — Storage Buckets
```
supabase/migrations/004_storage_buckets.sql
```
ينشئ buckets: `user-uploads`, `generated-images`, `generated-audio`, `generated-videos`, `avatars`  
+ policies للوصول (كل مستخدم يرى ملفاته فقط).

### Migration 005 — Seed Data
```
supabase/migrations/005_seed_studios.sql
```
يُدخل 11 استوديو + 8 أدوات AI في الجداول.

### Migration 006 — Image Studio Enhancements (M3)
```
supabase/migrations/006_images_metadata.sql
```
يضيف أعمدة `metadata` و `quality` لجدول `generated_images` (آمن للتشغيل مرات متعددة).

### Migration 007 — Audio & Video Enhancements (M4)
```
supabase/migrations/007_audio_video_enhance.sql
```
يضيف أعمدة لـ `generated_audio` (`speed`, `metadata`, `status`, `file_size`)
ولـ `generated_videos` (`platform`, `video_type`, `script`, `scenes`).
> ⚠️ **ملاحظة:** لا تضيف هذه الـ migration سياسات storage جديدة — storage policies موجودة في 004.

---

## الخطوة 4: التحقق من الجداول

بعد تشغيل جميع الـ migrations، من **Table Editor** يجب أن ترى:
- ✅ `profiles`
- ✅ `studios` (11 صف — 11 استوديو)
- ✅ `studio_generations`
- ✅ `conversations`
- ✅ `messages`
- ✅ `user_files`
- ✅ `generated_images`
- ✅ `generated_audio`
- ✅ `generated_videos`
- ✅ `research_projects`
- ✅ `research_sections`
- ✅ `user_usage`
- ✅ `ai_tools` (8 أدوات)

من **Storage**، يجب أن ترى:
- ✅ `user-uploads`
- ✅ `generated-images`
- ✅ `generated-audio`
- ✅ `generated-videos`
- ✅ `avatars`

---

## الخطوة 5: إعداد Authentication

### Email (مفعّل افتراضياً)
من **Authentication** → **Providers** → **Email**:
- ✅ Enable Email Provider
- اختر: Confirm email = مفعّل (للإنتاج)

### Google OAuth (اختياري)

#### أ. إنشاء OAuth App على Google
1. اذهب إلى [console.cloud.google.com](https://console.cloud.google.com)
2. أنشئ مشروعاً جديداً أو اختر موجوداً
3. من **APIs & Services** → **Credentials**
4. اضغط **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. أضف Authorized redirect URI:
   ```
   https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
   ```
7. انسخ **Client ID** و **Client Secret**

#### ب. إضافة Google في Supabase
1. من **Authentication** → **Providers** → **Google**
2. Enable Google Provider ✅
3. أدخل **Client ID** و **Client Secret**
4. احفظ

---

## الخطوة 6: إعداد URL Configuration

من **Authentication** → **URL Configuration**:

**Site URL:**
```
http://localhost:3000
```
(غيّره لرابط Vercel في الإنتاج)

**Redirect URLs:**
```
http://localhost:3000/auth/callback
https://your-app.vercel.app/auth/callback
```

---

## الخطوة 7: إنشاء أول مستخدم Admin

بعد تسجيل حسابك عبر التطبيق، شغّل هذا في SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

---

## ✅ قائمة التحقق النهائية

### Supabase Setup
- [ ] إنشاء مشروع Supabase
- [ ] نسخ مفاتيح الاتصال إلى `.env.local`
- [ ] تشغيل Migration 001 (الجداول الأساسية)
- [ ] تشغيل Migration 002 (RLS Policies)
- [ ] تشغيل Migration 003 (Triggers)
- [ ] تشغيل Migration 004 (Storage Buckets)
- [ ] تشغيل Migration 005 (Seed Data)
- [ ] تشغيل Migration 006 (Image Studio - M3)
- [ ] تشغيل Migration 007 (Audio & Video - M4)
- [ ] التحقق من وجود 13 جدول في Table Editor
- [ ] التحقق من وجود 5 buckets في Storage
- [ ] التحقق من وجود 11 استوديو في جدول `studios`
- [ ] إعداد Email Authentication
- [ ] إعداد Site URL و Redirect URLs
- [ ] (اختياري) إعداد Google OAuth
- [ ] تشغيل `npm run dev` والتسجيل بحساب جديد

### Environment Variables (`.env.local`)
```env
OPENAI_API_KEY=sk-...
OPENAI_DEFAULT_MODEL=gpt-4o-mini
OPENAI_IMAGE_MODEL=dall-e-3
OPENAI_TTS_MODEL=tts-1
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔧 استكشاف الأخطاء

### خطأ: "relation 'profiles' does not exist"
← تأكد أنك شغّلت Migration 001 بنجاح

### خطأ: "new row violates row-level security policy"
← تأكد أنك شغّلت Migration 002 (RLS Policies)

### المستخدم لا يُنشأ في profiles تلقائياً
← تأكد أنك شغّلت Migration 003 (Triggers) — تحديداً الـ `handle_new_user` trigger

### خطأ في Google OAuth
← تأكد أن Redirect URI مطابق تماماً في Google Console وفي Supabase

### لا ترى الاستوديوهات
← تأكد أنك شغّلت Migration 005 (Seed Data)

### رفع الصور لا يعمل (Image Studio)
← تأكد أنك شغّلت Migration 004 (Storage Buckets) وأن bucket `generated-images` موجود

### رفع الصوت لا يعمل (Audio Studio)
← تأكد أنك شغّلت Migration 004 (Storage Buckets) وأن bucket `generated-audio` موجود
← الـ fallback: إذا فشل الرفع، الصوت يُعاد كـ base64 data URL ويعمل في المشغّل مباشرة

### جدول generated_audio لا يحتوي على عمود speed
← تأكد أنك شغّلت Migration 007

### خطأ "duplicate key value violates unique constraint" في storage policies
← إذا شغّلت Migration 007 القديمة (قبل الإصلاح)، استخدم النسخة المحدّثة التي لا تُعيد إنشاء policies موجودة

### لا ترى metadata في generated_images
← تأكد أنك شغّلت Migration 006
