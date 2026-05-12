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

## الخطوة 3: تشغيل Migrations

من **SQL Editor** في Supabase Dashboard:

### Migration 1: الجداول
1. اضغط **New Query**
2. انسخ محتوى `supabase/migrations/001_init_schema.sql`
3. اضغط **Run** ✅

### Migration 2: سياسات RLS
1. اضغط **New Query**
2. انسخ محتوى `supabase/migrations/002_rls_policies.sql`
3. اضغط **Run** ✅

### Migration 3: Triggers
1. اضغط **New Query**
2. انسخ محتوى `supabase/migrations/003_triggers.sql`
3. اضغط **Run** ✅

### Migration 4: Storage Buckets
1. اضغط **New Query**
2. انسخ محتوى `supabase/migrations/004_storage_buckets.sql`
3. اضغط **Run** ✅

### Migration 5: البيانات الأولية
1. اضغط **New Query**
2. انسخ محتوى `supabase/migrations/005_seed_studios.sql`
3. اضغط **Run** ✅

### التحقق من الجداول
بعد تشغيل المigrations، من **Table Editor** يجب أن ترى:
- `profiles`
- `studios` (تحتوي على 11 صف)
- `studio_generations`
- `conversations`
- `messages`
- `user_files`
- `generated_images`
- `generated_audio`
- `generated_videos`
- `research_projects`
- `research_sections`
- `user_usage`
- `ai_tools` (تحتوي على 8 أدوات)

---

## الخطوة 4: إعداد Authentication

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

## الخطوة 5: إعداد URL Configuration

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

## الخطوة 6: Storage (اختياري — للصور والملفات)

من **Storage**، تأكد أن هذه الـ buckets موجودة:
- `user-uploads`
- `generated-images`
- `generated-audio`
- `generated-videos`
- `avatars`

إذا لم تُنشأ من migration 004، أنشئها يدوياً من **Storage** → **New Bucket**.

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

- [ ] إنشاء مشروع Supabase
- [ ] نسخ مفاتيح الاتصال إلى `.env.local`
- [ ] تشغيل Migration 001 (الجداول)
- [ ] تشغيل Migration 002 (RLS)
- [ ] تشغيل Migration 003 (Triggers)
- [ ] تشغيل Migration 004 (Storage)
- [ ] تشغيل Migration 005 (Seed Data)
- [ ] التحقق من وجود 11 استوديو في جدول `studios`
- [ ] إعداد Email Authentication
- [ ] إعداد Site URL و Redirect URLs
- [ ] (اختياري) إعداد Google OAuth
- [ ] تشغيل `npm run dev` والتسجيل بحساب جديد

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
