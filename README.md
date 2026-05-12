# 🤖 AI Universal Assistant — AI Studio Platform

منصة استوديوهات الذكاء الاصطناعي المتكاملة | **11 استوديو AI في مكان واحد**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-latest-3ECF8E?logo=supabase)](https://supabase.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai)](https://openai.com)

---

## 🎬 الاستوديوهات المتاحة

| # | الاستوديو | الوصف | الحالة |
|---|-----------|-------|--------|
| 1 | 💬 استوديو المحادثة | محادثة AI متعددة الأنواع مع حفظ السجل | ✅ M1 |
| 2 | ✍️ استوديو المقالات | مقالات SEO، تقنية، تسويقية | ✅ M1 |
| 3 | 🌐 استوديو الترجمة | ترجمة أكاديمية، تسويقية، تقنية | ✅ M1 |
| 4 | 🎓 استوديو الأبحاث | مساعدة ماجستير ودكتوراه | 🔜 M2 |
| 5 | 🎥 استوديو السوشيال | يوتيوب، تيك توك، إنستغرام | 🔜 M2 |
| 6 | 📊 تحليل القنوات | تحليل وتحسين القنوات | 🔜 M2 |
| 7 | 🖼️ الصور المصغرة | prompts وأفكار thumbnails | 🔜 M2 |
| 8 | 🎨 توليد الصور | DALL·E 3 + معرض + تنزيل | ✅ M3 |
| 9 | 🔊 توليد الصوت | OpenAI TTS | 🔜 M4 |
| 10 | 🎞️ توليد الفيديو | واجهة + stub | 🔜 M4 |
| 11 | 📚 الكتب وأدوات AI | تلخيص + دليل أدوات | ✅ M2 |

---

## 🚀 البدء السريع

### المتطلبات
- Node.js 18+
- npm أو yarn
- حساب [Supabase](https://supabase.com) (مجاني)
- مفتاح [OpenAI API](https://platform.openai.com)

### 1. استنساخ المشروع
```bash
git clone https://github.com/alialiwy1993-source/ai-universal-assistant.git
cd ai-universal-assistant
npm install
```

### 2. إعداد المتغيرات البيئية
```bash
cp .env.example .env.local
```
افتح `.env.local` وأضف قيمك (راجع [دليل Supabase](#-دليل-إعداد-supabase)):
```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. تشغيل المشروع
```bash
npm run dev
```
افتح [http://localhost:3000](http://localhost:3000)

---

## 📋 دليل إعداد Supabase

### الخطوة 1 — إنشاء مشروع جديد
1. اذهب إلى [supabase.com](https://supabase.com) وسجّل الدخول
2. اضغط **New Project**
3. اختر Organization واسم المشروع وكلمة مرور DB
4. اختر المنطقة الأقرب لك (ينصح بـ EU West أو US East)
5. انتظر حتى يكتمل الإنشاء (~1 دقيقة)

### الخطوة 2 — جلب مفاتيح الاتصال
من **Settings → API**:
- `Project URL` → ضعها في `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → ضعها في `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → ضعها في `SUPABASE_SERVICE_ROLE_KEY` (**سري — لا تشاركه**)

### الخطوة 3 — تشغيل Migrations
من **SQL Editor** في Supabase Dashboard، شغّل الملفات بالترتيب:

```sql
-- 1. الجداول الأساسية
-- انسخ محتوى: supabase/migrations/001_init_schema.sql

-- 2. سياسات الأمان
-- انسخ محتوى: supabase/migrations/002_rls_policies.sql

-- 3. الـ Triggers
-- انسخ محتوى: supabase/migrations/003_triggers.sql

-- 4. Storage Buckets
-- انسخ محتوى: supabase/migrations/004_storage_buckets.sql

-- 5. البيانات الأولية (studios + أدوات AI)
-- انسخ محتوى: supabase/migrations/005_seed_studios.sql
```

> **نصيحة:** شغّل كل ملف منفرداً وتأكد أنه نجح قبل الانتقال للتالي.

### الخطوة 4 — إعداد Authentication
من **Authentication → Providers**:
1. **Email** → تأكد أنه مفعّل ✅
2. **Google** (اختياري):
   - اذهب إلى [Google Cloud Console](https://console.cloud.google.com)
   - أنشئ OAuth 2.0 credentials
   - أضف Redirect URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
   - انسخ Client ID و Secret إلى Supabase

### الخطوة 5 — إعداد Email Templates (اختياري)
من **Authentication → Email Templates**، يمكنك تخصيص:
- رسالة تأكيد البريد
- رسالة استعادة كلمة المرور

### الخطوة 6 — URL Configuration
من **Authentication → URL Configuration**:
- **Site URL**: `http://localhost:3000` (للتطوير) أو رابط Vercel (للإنتاج)
- **Redirect URLs**: أضف `http://localhost:3000/auth/callback`

---

## 🏗️ هيكل المشروع

```
ai-universal-assistant/
├── src/
│   ├── app/
│   │   ├── (auth)/          # صفحات تسجيل الدخول والتسجيل
│   │   ├── (app)/           # صفحات المحمية (dashboard, studios...)
│   │   ├── api/             # API Routes
│   │   └── layout.tsx       # Root layout (RTL + Dark)
│   ├── components/
│   │   ├── layout/          # Sidebar, Topbar
│   │   └── studios/         # مكونات الاستوديوهات
│   ├── lib/
│   │   ├── supabase/        # Clients (browser/server/admin)
│   │   ├── openai/          # Client + Prompts
│   │   ├── constants/       # Studios, Models, Limits
│   │   ├── validators/      # Zod schemas
│   │   └── i18n/            # النصوص العربية
│   ├── hooks/               # React hooks
│   └── types/               # TypeScript types
├── supabase/
│   └── migrations/          # SQL files (001-005)
└── docs/
```

---

## ⚙️ المتغيرات البيئية

| المتغير | الوصف | مطلوب |
|---------|-------|--------|
| `OPENAI_API_KEY` | مفتاح OpenAI API | ✅ |
| `OPENAI_DEFAULT_MODEL` | الموديل الافتراضي للنص (gpt-4o-mini) | اختياري |
| `OPENAI_IMAGE_MODEL` | موديل توليد الصور (dall-e-3) | اختياري |
| `NEXT_PUBLIC_SUPABASE_URL` | رابط مشروع Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | المفتاح العام | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | مفتاح الخدمة (سري) | ✅ |
| `NEXT_PUBLIC_APP_URL` | رابط التطبيق | اختياري |
| `FREE_USAGE_LIMIT` | حد الاستخدام المجاني (100) | اختياري |
| `MAX_PDF_SIZE_MB` | أقصى حجم PDF (10) | اختياري |

---

## 🛠️ الأوامر المتاحة

```bash
npm run dev          # تشغيل بيئة التطوير
npm run build        # بناء المشروع للإنتاج
npm run start        # تشغيل الإنتاج
npm run lint         # فحص الكود
npm run type-check   # فحص TypeScript
```

---

## 🚀 النشر على Vercel

1. ادفع الكود إلى GitHub
2. اذهب إلى [vercel.com](https://vercel.com) وأنشئ مشروعاً جديداً
3. اربطه بالـ repo
4. أضف **Environment Variables** (نفس `.env.local`)
5. انقر Deploy 🎉

> **تذكر:** في Supabase، أضف رابط Vercel إلى قائمة الـ Redirect URLs المسموحة.

---

## 🗺️ خطة التطوير

| Milestone | المحتوى | الحالة |
|-----------|---------|--------|
| **M0** | Foundation + Database + Auth | ✅ مكتمل |
| **M1** | Dashboard + Chat + Articles + Translation | ✅ مكتمل |
| **M2** | Research + Social + Channel + Thumbnails + Books | ✅ مكتمل |
| **M3** | Image Studio (DALL·E 3) + Gallery | ✅ مكتمل |
| **M4** | Audio + Video Studios | 🔜 |

---

## 🔒 الأمان

- ✅ Row Level Security (RLS) على جميع جداول Supabase
- ✅ مفاتيح API في Server-side فقط (لا تصل للـ client)
- ✅ Middleware يحمي الصفحات المحمية
- ✅ Zod validation على جميع API inputs
- ✅ Service Role Key لا يُستخدم إلا في Server Components

---

## 📝 الترخيص

MIT License — © 2026 AI Universal Assistant
