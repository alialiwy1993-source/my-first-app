# 🤖 AI Universal Assistant — AI Studio Platform

منصة استوديوهات الذكاء الاصطناعي المتكاملة | **11 استوديو AI في مكان واحد**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-latest-3ECF8E?logo=supabase)](https://supabase.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai)](https://openai.com)

---

## 🎬 الاستوديوهات (11 استوديو)

| # | الاستوديو | الوصف | M |
|---|-----------|-------|---|
| 1 | 💬 **المحادثة** | محادثة AI مع 6 أنواع مساعدين + streaming + حفظ المحادثات | M1 |
| 2 | ✍️ **المقالات** | مقالات SEO / تقنية / تسويقية / تعليمية | M1 |
| 3 | 🌐 **الترجمة** | ترجمة + تحسين + إعادة صياغة + كشف أخطاء | M1 |
| 4 | 🎓 **الأبحاث** | مساعد أكاديمي للبكالوريوس / ماجستير / دكتوراه | M2 |
| 5 | 🎥 **السوشيال** | محتوى يوتيوب + تيك توك + إنستغرام + Reels | M2 |
| 6 | 📊 **تحليل القنوات** | تحليل قناتك + نقاط قوة/ضعف + اقتراحات | M2 |
| 7 | 🖼️ **الصور المصغرة** | أفكار + نصوص + ألوان + Prompts للثمبنيل | M2 |
| 8 | 📚 **الكتب وأدوات AI** | تلخيص + خطة قراءة + دليل أدوات AI | M2 |
| 9 | 🎨 **توليد الصور** | DALL·E 3 + 8 أنماط + معرض + تنزيل | M3 |
| 10 | 🔊 **توليد الصوت** | OpenAI TTS + 6 أصوات + تنزيل MP3 | M4 |
| 11 | 🎞️ **توليد الفيديو** | سكربت + مشاهد + Prompts (ربط API الفيديو قادم) | M4 |

---

## 🚀 البدء السريع

### المتطلبات
- Node.js 18+
- مفتاح [OpenAI API](https://platform.openai.com/api-keys)
- حساب [Supabase](https://supabase.com) (مجاني)

### التثبيت
```bash
git clone https://github.com/alialiwy1993-source/my-first-app.git -b ai-studio-platform
cd my-first-app
npm install
```

### إعداد المتغيرات البيئية
```bash
cp .env.example .env.local
```
ثم أضف قيمك في `.env.local` (راجع [دليل Supabase](docs/supabase-setup.md)):

```env
OPENAI_API_KEY=sk-...
OPENAI_DEFAULT_MODEL=gpt-4o-mini
OPENAI_IMAGE_MODEL=dall-e-3
OPENAI_TTS_MODEL=tts-1
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### إعداد Supabase
راجع [`docs/supabase-setup.md`](docs/supabase-setup.md) للإرشادات الكاملة.

**الخلاصة:** شغّل الـ 7 migrations بالترتيب من Supabase SQL Editor:
```
001_init_schema.sql → 002_rls_policies.sql → 003_triggers.sql
004_storage_buckets.sql → 005_seed_studios.sql
006_images_metadata.sql → 007_audio_video_enhance.sql
```

### تشغيل المشروع
```bash
npm run dev
```
افتح [http://localhost:3000](http://localhost:3000)

---

## 🏗️ هيكل المشروع

```
src/
├── app/
│   ├── (auth)/              # Login / Register / Reset Password
│   ├── (app)/               # Protected pages (Dashboard, Studios...)
│   │   ├── dashboard/       # لوحة التحكم + إحصائيات
│   │   ├── studios/         # 11 استوديو + gallery
│   │   ├── history/         # سجل التوليدات
│   │   ├── profile/         # الملف الشخصي
│   │   └── settings/        # الإعدادات
│   ├── api/                 # API Routes (server-side)
│   │   ├── chat/            # Streaming chat
│   │   ├── conversations/   # CRUD للمحادثات
│   │   ├── generate/[studio]/ # Unified generate endpoint
│   │   ├── images/generate/ # DALL-E image generation
│   │   └── audio/generate/  # OpenAI TTS
│   └── layout.tsx           # Root layout (RTL + Dark)
├── components/
│   ├── layout/              # AppSidebar, AppTopbar
│   ├── studios/             # Studio components + Chat components
│   └── ui/                  # MarkdownRenderer, Spinner, Toast
├── hooks/                   # useChat, useUser, useConversations, useGeneration
├── lib/
│   ├── supabase/            # browser + server + admin + middleware
│   ├── openai/              # client + stream + 9 prompt files
│   ├── constants/           # studios, models, limits
│   └── utils.ts
└── types/
    ├── database.ts          # 10 TypeScript interfaces
    ├── chat.ts
    └── studios.ts
```

---

## 🔌 API Routes

| Method | Endpoint | الاستخدام |
|--------|----------|-----------|
| POST | `/api/chat` | Streaming chat (SSE) |
| GET/POST | `/api/conversations` | قائمة / إنشاء محادثة |
| GET/PATCH/DELETE | `/api/conversations/[id]` | تفاصيل / تعديل / حذف |
| POST | `/api/generate/[studio]` | توليد النص (8 استوديوهات) |
| POST + GET | `/api/images/generate` | DALL·E توليد + قائمة |
| POST + GET | `/api/audio/generate` | OpenAI TTS توليد + قائمة |
| GET/PATCH | `/api/user/profile` | الملف الشخصي |
| GET | `/api/user/stats` | الإحصائيات |
| PATCH | `/api/user/settings` | الإعدادات |

---

## 🗄️ قاعدة البيانات (13 جدول)

| الجدول | الاستخدام |
|--------|----------|
| `profiles` | بيانات المستخدمين + الاشتراكات + الإعدادات |
| `studios` | كتالوج الاستوديوهات (11 استوديو) |
| `studio_generations` | جدول مركزي لكل التوليدات |
| `conversations` | محادثات Chat Studio |
| `messages` | رسائل كل محادثة |
| `generated_images` | صور DALL·E |
| `generated_audio` | ملفات TTS |
| `generated_videos` | سكربتات الفيديو |
| `research_projects` | مشاريع بحثية |
| `research_sections` | أقسام كل مشروع |
| `user_files` | ملفات مرفوعة |
| `user_usage` | سجل الاستخدام |
| `ai_tools` | دليل أدوات AI |

---

## ⚙️ متغيرات البيئة

| المتغير | الوصف | القيمة الافتراضية |
|---------|-------|------------------|
| `OPENAI_API_KEY` | مفتاح OpenAI | — |
| `OPENAI_DEFAULT_MODEL` | موديل النصوص | `gpt-4o-mini` |
| `OPENAI_IMAGE_MODEL` | موديل الصور | `dall-e-3` |
| `OPENAI_TTS_MODEL` | موديل الصوت | `tts-1` |
| `NEXT_PUBLIC_SUPABASE_URL` | رابط Supabase | — |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | المفتاح العام | — |
| `SUPABASE_SERVICE_ROLE_KEY` | مفتاح الخدمة (سري) | — |
| `NEXT_PUBLIC_APP_URL` | رابط التطبيق | `http://localhost:3000` |
| `FREE_USAGE_LIMIT` | حد الاستخدام المجاني | `100` |

---

## 🛠️ الأوامر

```bash
npm run dev          # بيئة التطوير
npm run build        # بناء للإنتاج
npm run start        # تشغيل الإنتاج
npm run lint         # فحص ESLint
npm run type-check   # فحص TypeScript
```

---

## 🔒 الأمان

| الميزة | الحالة |
|--------|--------|
| RLS على جميع الجداول | ✅ |
| OpenAI API Key — server-side فقط | ✅ |
| Supabase Service Role — server-side فقط | ✅ |
| حماية الصفحات عبر middleware | ✅ |
| Zod validation على API inputs | ✅ |
| Storage: كل مستخدم يرى ملفاته فقط | ✅ |

---

## 🚀 النشر على Vercel

1. ادفع الكود إلى GitHub
2. اذهب إلى [vercel.com](https://vercel.com) وأنشئ مشروعاً جديداً
3. اربطه بالـ repo واختر branch `ai-studio-platform`
4. أضف **Environment Variables** (نفس `.env.local`)
5. في Supabase: أضف رابط Vercel إلى **Redirect URLs**
6. انقر Deploy 🎉

---

## 🗺️ Milestones

| Milestone | المحتوى | الحالة |
|-----------|---------|--------|
| **M0** | Foundation + DB (12 tables) + Auth + RTL | ✅ مكتمل |
| **M1** | Chat + Articles + Translation | ✅ مكتمل |
| **M2** | Research + Social + Channel + Thumbnails + Books | ✅ مكتمل |
| **M3** | Image Studio (DALL·E 3) + Gallery | ✅ مكتمل |
| **M4** | Audio Studio (TTS) + Video Studio (Script Gen) | ✅ مكتمل |
| **M5** | Admin Panel + Analytics | 🔜 |
| **M6** | Video API (Runway/Pika) + Stripe | 🔜 |

---

## 📄 الترخيص

MIT License — © 2026 AI Universal Assistant
