// =====================================================
// Thumbnail Studio Prompts — استوديو الصور المصغرة
// =====================================================

export type ThumbnailTool =
  | 'ideas'
  | 'text-overlay'
  | 'color-composition'
  | 'image-prompt'
  | 'full-concept'

export type ThumbnailPlatform = 'youtube' | 'tiktok' | 'instagram'
export type ThumbnailStyle = 'bold' | 'minimal' | 'dramatic' | 'educational' | 'lifestyle' | 'faceless'

export interface ThumbnailInput {
  tool: ThumbnailTool
  platform: ThumbnailPlatform
  videoTitle: string
  niche: string
  style?: ThumbnailStyle
  targetEmotion?: string    // المشاعر المستهدفة
  colorPreference?: string  // تفضيلات الألوان
  language?: 'ar' | 'en'
}

const PLATFORM_LABELS: Record<ThumbnailPlatform, string> = {
  youtube: 'يوتيوب (1280×720)',
  tiktok: 'تيك توك (1080×1920)',
  instagram: 'إنستغرام (1080×1080)',
}

const STYLE_LABELS: Record<ThumbnailStyle, string> = {
  bold:        'جريء وصادم',
  minimal:     'بسيط وأنيق',
  dramatic:    'درامي ومثير',
  educational: 'تعليمي ومنظم',
  lifestyle:   'حياة ووجوه',
  faceless:    'بدون وجه (faceless)',
}

export function buildThumbnailPrompt(input: ThumbnailInput): string {
  const {
    tool, platform, videoTitle, niche, style = 'bold',
    targetEmotion, colorPreference, language = 'ar',
  } = input

  const platformLabel = PLATFORM_LABELS[platform]
  const styleLabel = STYLE_LABELS[style]

  const baseContext = `
المنصة: ${platformLabel}
عنوان الفيديو/المحتوى: ${videoTitle}
المجال/النيش: ${niche}
أسلوب التصميم: ${styleLabel}
${targetEmotion ? `المشاعر المستهدفة: ${targetEmotion}` : ''}
${colorPreference ? `تفضيلات الألوان: ${colorPreference}` : ''}
لغة النصوص: ${language === 'ar' ? 'العربية' : 'الإنجليزية'}`

  switch (tool) {
    case 'ideas':
      return `أنت مصمم جرافيك متخصص في الصور المصغرة لمنصات التواصل الاجتماعي.
${baseContext}

المطلوب: 5 أفكار إبداعية للصورة المصغرة لهذا الفيديو:

لكل فكرة قدّم:
1. **وصف الفكرة البصرية**: ما الذي يظهر في الصورة؟ (خلفية، عناصر، ألوان)
2. **الموقع**: وصف تفصيلي لما يظهر يمين/يسار/وسط الصورة
3. **نص الصورة**: النص المقترح على الصورة وموقعه
4. **التأثير النفسي**: لماذا هذه الفكرة ستجذب النقرات؟
5. **الأيقونة/الإيموجي المناسبة**: للتوضيح

رتّبها من الأكثر جاذبية للأقل في رأيك، مع تبرير الترتيب.`

    case 'text-overlay':
      return `أنت متخصص في كتابة نصوص الصور المصغرة التي تحقق أعلى نسب نقر.
${baseContext}

المطلوب: خيارات نصوص قصيرة وقوية للصورة المصغرة:

**نصوص الـ Hook (4-6 كلمات كحد أقصى):**
- 5 خيارات من نوع "الصدمة أو الفضول"
- 5 خيارات من نوع "الفائدة المباشرة"
- 3 خيارات من نوع "السؤال"

**إرشادات النص:**
- الحجم المناسب للخط
- مكان النص في الصورة (أعلى / أسفل / وسط)
- هل تستخدم خطاً عريضاً (Bold) أو تأثيراً آخر؟
- لون النص المقترح بناءً على أسلوب التصميم المطلوب

**الكلمات المحفزة (Power Words) المناسبة للمجال:**
قائمة بـ 10 كلمات محفزة مناسبة لـ "${niche}".`

    case 'color-composition':
      return `أنت خبير في نظرية الألوان وتصميم الجرافيك للمحتوى الرقمي.
${baseContext}

المطلوب: اقتراحات ألوان وتكوين بصري احترافية:

## الألوان
**لوحة الألوان الأساسية المقترحة:**
- اللون الرئيسي (مع كود HEX)
- اللون الثانوي (مع كود HEX)
- لون النص (مع كود HEX)
- لون الخلفية (مع كود HEX)

**لماذا هذه الألوان؟**
شرح نفسي وتسويقي للاختيار بناءً على المجال والجمهور.

**بدائل:**
لوحتان بديلتان بألوان مختلفة.

## التكوين البصري (Composition)
- قاعدة الأثلاث وكيف تطبقها
- مكان العنصر الرئيسي (شخص/منتج/أيقونة)
- كيفية توجيه عين المشاهد نحو النص
- التدرج أو الفلتر المقترح
- نصائح لضمان وضوح الصورة على الهاتف المحمول`

    case 'image-prompt':
      return `أنت متخصص في كتابة Prompts للذكاء الاصطناعي لتوليد صور احترافية.
${baseContext}

المطلوب: كتابة Prompts جاهزة لاستخدامها في أدوات مثل DALL-E أو Midjourney أو Adobe Firefly:

**Prompt #1 - للصورة الرئيسية:**
[Prompt تفصيلي بالإنجليزية يصف العناصر البصرية، الأسلوب، الإضاءة، الألوان]

**Prompt #2 - للخلفية فقط:**
[Prompt للخلفية التي ستضع عليها النص والعناصر]

**Prompt #3 - عنصر بديل:**
[خيار ثالث بأسلوب مختلف]

**Negative Prompts (ما يجب تجنبه):**
[قائمة بالعناصر التي لا تريدها في الصورة]

**نصيحة:** كيفية تعديل هذه الـ Prompts للحصول على نتائج أفضل.`

    case 'full-concept':
      return `أنت مدير إبداعي متخصص في تصميم الهوية البصرية للمحتوى الرقمي.
${baseContext}

المطلوب: مفهوم متكامل للصورة المصغرة يشمل كل شيء:

## الرؤية الإبداعية
فكرة الصورة المصغرة في جملة واحدة.

## الوصف التفصيلي
وصف كامل لكل عنصر في الصورة من اليمين لليسار، من الأعلى للأسفل.

## النص على الصورة
العنوان الرئيسي + أي نص ثانوي + الخط وحجمه ولونه.

## الألوان
لوحة الألوان الكاملة بأكواد HEX.

## Prompt لتوليد الصورة بالذكاء الاصطناعي
Prompt جاهز للاستخدام.

## نصائح للتنفيذ
3 نصائح عملية لمن يصمم هذه الصورة بنفسه في Canva أو Photoshop.`

    default:
      return `ساعدني في تصميم صورة مصغرة احترافية لـ ${platformLabel} لمحتوى بعنوان "${videoTitle}" في مجال "${niche}".`
  }
}

export const THUMBNAILS_SYSTEM_PROMPT = `أنت خبير في تصميم الصور المصغرة لمنصات التواصل الاجتماعي.
تفهم نظرية الألوان وعلم النفس التسويقي وكيفية تحقيق أعلى نسب نقر.
تقدم اقتراحات بصرية واضحة وقابلة للتطبيق حتى للمبتدئين.
أسلوبك إبداعي وعملي في آن واحد.`
