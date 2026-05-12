// =====================================================
// Video Studio Prompts
// الهدف: توليد سكربت + مشاهد + metadata للفيديو
// (الواجهة جاهزة — API فيديو يُضاف لاحقاً)
// =====================================================

export type VideoPlatform = 'youtube' | 'tiktok' | 'instagram' | 'reels'
export type VideoType =
  | 'educational'
  | 'entertainment'
  | 'tutorial'
  | 'vlog'
  | 'product-review'
  | 'motivational'
  | 'news'
  | 'documentary'

export type VideoDuration = '30s' | '60s' | '3min' | '5min' | '10min' | '15min'

export interface VideoInput {
  idea: string
  platform: VideoPlatform
  videoType: VideoType
  duration: VideoDuration
  style?: string
  targetAudience?: string
  tone?: string
  language?: 'ar' | 'en'
}

const PLATFORM_LABELS: Record<VideoPlatform, string> = {
  youtube:   'يوتيوب',
  tiktok:    'تيك توك',
  instagram: 'إنستغرام',
  reels:     'Reels / Shorts',
}

const DURATION_GUIDE: Record<VideoDuration, string> = {
  '30s':  '30 ثانية (6-8 مشاهد)',
  '60s':  '60 ثانية (8-12 مشهد)',
  '3min': '3 دقائق (12-15 مشهد)',
  '5min': '5 دقائق (15-20 مشهد)',
  '10min':'10 دقائق (20-25 مشهد)',
  '15min':'15 دقيقة (25-30 مشهد)',
}

const TYPE_LABELS: Record<VideoType, string> = {
  'educational':   'تعليمي',
  'entertainment': 'ترفيهي',
  'tutorial':      'شرح خطوة بخطوة',
  'vlog':          'فلوج يومي',
  'product-review':'مراجعة منتج',
  'motivational':  'تحفيزي وإلهامي',
  'news':          'إخباري',
  'documentary':   'وثائقي',
}

export function buildVideoPrompt(input: VideoInput): string {
  const {
    idea, platform, videoType, duration,
    style, targetAudience, tone = 'engaging', language = 'ar',
  } = input

  const platformLabel  = PLATFORM_LABELS[platform]
  const durationGuide  = DURATION_GUIDE[duration]
  const typeLabel      = TYPE_LABELS[videoType]
  const langLabel      = language === 'ar' ? 'العربية' : 'الإنجليزية'

  return `أنت مخرج محتوى رقمي محترف ومتخصص في إنتاج الفيديوهات لمنصة ${platformLabel}.

## تفاصيل الفيديو المطلوب
- **الفكرة/الموضوع:** ${idea}
- **نوع الفيديو:** ${typeLabel}
- **المنصة:** ${platformLabel}
- **المدة:** ${durationGuide}
- **اللغة:** ${langLabel}
${style ? `- **الأسلوب البصري:** ${style}` : ''}
${targetAudience ? `- **الجمهور المستهدف:** ${targetAudience}` : ''}
- **نبرة المحتوى:** ${tone}

## المطلوب منك بالترتيب:

### 1. 🎯 الفكرة المحسّنة
صغ الفكرة الأصلية في جملة واحدة مثيرة وجذابة.

### 2. 🪝 الـ Hook (أول 3-5 ثواني)
كتابة Hook صادمة تجعل المشاهد يبقى. جملة واحدة فقط.

### 3. 📜 السكربت الكامل
اكتب السكربت كاملاً كما سيُقرأ/يُقال بالضبط. استخدم النبرة المطلوبة.
ضع [وقفة] عند المواضع المهمة، و[مؤثر صوتي] عند الحاجة.

### 4. 🎬 تقسيم المشاهد
قدّم جدولاً بالمشاهد يشمل لكل مشهد:
- رقم المشهد
- الوقت (من/إلى)
- وصف المشهد بصرياً
- النص المنطوق
- الموسيقى/المؤثرات المقترحة
- نوع اللقطة (close-up / wide / B-roll...)

### 5. 🖼️ Prompts للصور/الفيديو
اكتب 5 Prompts بالإنجليزية لتوليد المشاهد البصرية بأدوات AI (DALL-E / Midjourney / Runway).

### 6. 🎙️ التعليق الصوتي المقترح
الجملة الأولى والأخيرة من التعليق الصوتي.

### 7. 📝 وصف الفيديو (Description)
وصف جاهز للنشر على ${platformLabel} مع كلمات مفتاحية مضمّنة.

### 8. 🎯 عناوين مقترحة (5 عناوين)
عناوين جذابة لنشر الفيديو.

### 9. #️⃣ الهاشتاقات
20 هاشتاق مناسب للمنصة والمحتوى.

### 10. ✅ نصائح الإنتاج
3 نصائح عملية لتصوير هذا الفيديو بأفضل جودة.`
}

export const VIDEO_SYSTEM_PROMPT = `أنت مخرج ومنتج محتوى رقمي محترف.
تتقن كتابة السكربتات لجميع أنواع الفيديو على منصات يوتيوب وتيك توك وإنستغرام.
مخرجاتك دقيقة ومنظمة وجاهزة للتنفيذ مباشرة.
تكتب بأسلوب جذاب يناسب الجمهور العربي.`
