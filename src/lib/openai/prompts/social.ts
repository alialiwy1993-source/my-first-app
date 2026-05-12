// =====================================================
// Social Media Studio Prompts — يوتيوب / تيك توك / إنستغرام
// =====================================================

export type SocialTool =
  | 'content-ideas'
  | 'video-script'
  | 'video-description'
  | 'catchy-titles'
  | 'hashtags'
  | 'content-plan'
  | 'hook'
  | 'cta'
  | 'article-to-script'
  | 'short-content'

export type SocialPlatform = 'youtube' | 'tiktok' | 'instagram' | 'all'
export type ContentNiche = string

export interface SocialInput {
  tool: SocialTool
  platform: SocialPlatform
  niche: string          // مجال القناة
  topic: string          // موضوع المحتوى
  targetAudience?: string
  tone?: 'energetic' | 'professional' | 'casual' | 'educational' | 'entertaining'
  duration?: string      // مدة الفيديو
  articleText?: string   // للتحويل من مقال
  language?: 'ar' | 'en'
}

export const SOCIAL_TOOL_LABELS: Record<SocialTool, string> = {
  'content-ideas':     'أفكار محتوى',
  'video-script':      'سكربت فيديو',
  'video-description': 'وصف الفيديو',
  'catchy-titles':     'عناوين جذابة',
  'hashtags':          'هاشتاقات',
  'content-plan':      'خطة نشر',
  'hook':              'Hook - أول 3 ثواني',
  'cta':               'Call to Action',
  'article-to-script': 'تحويل مقال لسكربت',
  'short-content':     'Reels / Shorts / TikTok',
}

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  youtube:   'يوتيوب',
  tiktok:    'تيك توك',
  instagram: 'إنستغرام',
  all:       'كل المنصات',
}

const TONE_LABELS = {
  energetic:     'حماسي وطاقة عالية',
  professional:  'احترافي وموثوق',
  casual:        'غير رسمي وقريب',
  educational:   'تعليمي وتثقيفي',
  entertaining:  'ترفيهي وممتع',
}

export function buildSocialPrompt(input: SocialInput): string {
  const {
    tool, platform, niche, topic, targetAudience,
    tone = 'casual', duration, articleText, language = 'ar',
  } = input

  const platformLabel = PLATFORM_LABELS[platform]
  const toneLabel = TONE_LABELS[tone]
  const audienceText = targetAudience ? `الجمهور المستهدف: ${targetAudience}` : ''
  const durationText = duration ? `مدة الفيديو المطلوبة: ${duration}` : ''

  const baseContext = `
المنصة: ${platformLabel}
المجال/النيش: ${niche}
الموضوع: ${topic}
الأسلوب: ${toneLabel}
${audienceText}
${durationText}
لغة الإخراج: ${language === 'ar' ? 'العربية' : 'الإنجليزية'}`

  switch (tool) {
    case 'content-ideas':
      return `أنت خبير استراتيجي في إنشاء المحتوى الرقمي.
${baseContext}

المطلوب: قائمة بـ 10 أفكار محتوى مميزة لـ ${platformLabel} في مجال "${niche}" حول موضوع "${topic}":

لكل فكرة اذكر:
1. عنوان جذاب للفيديو/المنشور
2. الفكرة الرئيسية في جملة
3. لماذا ستنجح مع الجمهور (السبب النفسي أو العملي)
4. نوع المحتوى (تعليمي / ترفيهي / إلهامي / إخباري / قصة)

رتّبها من الأكثر جاذبية للأقل.`

    case 'video-script':
      return `أنت كاتب سكربتات محترف لـ ${platformLabel}.
${baseContext}

المطلوب: كتابة سكربت فيديو كامل ومنظم يشمل:

**Hook (أول 5-10 ثواني):**
جملة صادمة أو سؤال مثير أو وعد قوي يجعل المشاهد يبقى.

**المقدمة (15-20 ثانية):**
تعريف سريع بالموضوع والفائدة التي سيحصل عليها المشاهد.

**الجسم الرئيسي:**
المحتوى الفعلي مقسماً إلى نقاط واضحة ومرقمة مع انتقالات سلسة.

**الخلاصة والـ CTA:**
تلخيص سريع + طلب واضح (اشترك / أعجبني / علّق / شاركه).

الطول المناسب لـ ${platformLabel}: ${platform === 'youtube' ? '7-12 دقيقة' : platform === 'tiktok' ? '30-90 ثانية' : '30-60 ثانية'}.`

    case 'video-description':
      return `أنت متخصص في تحسين محركات البحث للمحتوى الرقمي (Video SEO).
${baseContext}

المطلوب: كتابة وصف فيديو احترافي لـ ${platformLabel} يشمل:

**فقرة افتتاحية (50-100 كلمة):**
ملخص جذاب للفيديو مع الكلمة المفتاحية الرئيسية في أول سطر.

**محتوى الفيديو:**
قائمة بالنقاط الرئيسية مع الوقت (timestamps) إذا كان يوتيوب.

**Links & Resources:**
روابط أو مصادر مقترحة (placeholder قابل للتعديل).

**قسم الـ SEO:**
كلمات مفتاحية مناسبة للخوارزمية (5-10 كلمات/عبارات).

**CTA نهائي:**
طلب واضح للمشاهد.`

    case 'catchy-titles':
      return `أنت خبير في كتابة عناوين المحتوى الرقمي التي تحقق نسب نقر عالية (CTR).
${baseContext}

المطلوب: 15 عنوان جذاب لـ ${platformLabel} حول "${topic}":

5 عناوين من نوع "الفضول والإثارة" (تفتح حلقة ذهنية)
5 عناوين من نوع "الفائدة المباشرة" (ماذا سيحصل المشاهد)
5 عناوين من نوع "القائمة والأرقام"

لكل عنوان: اشرح لماذا هو فعّال نفسياً في جملة واحدة.
رتّبها من الأقوى للأضعف في رأيك.`

    case 'hashtags':
      return `أنت متخصص في استراتيجية الهاشتاقات وتحسين الاكتشاف على منصات التواصل.
${baseContext}

المطلوب: استراتيجية هاشتاقات كاملة لـ ${platformLabel}:

**هاشتاقات رئيسية (منافسة عالية - 5-8 هاشتاق):**
هاشتاقات واسعة وكبيرة في المجال.

**هاشتاقات متوسطة (منافسة متوسطة - 8-10 هاشتاقات):**
أكثر تخصصاً وفرصة للظهور أعلى.

**هاشتاقات متخصصة (منافسة منخفضة - 5-8 هاشتاقات):**
نيش محدد وفرصة الظهور الأولى.

**هاشتاقات الوسم الشخصي (2-3):**
للبراند الشخصي.

أضف نصيحة لكيفية تدوير الهاشتاقات.`

    case 'content-plan':
      return `أنت مخطط محتوى استراتيجي لمنشئي المحتوى.
${baseContext}

المطلوب: خطة نشر شهرية (4 أسابيع) لـ ${platformLabel} في مجال "${niche}":

لكل أسبوع:
- عدد المنشورات/الفيديوهات المقترحة
- أفكار المحتوى المحددة
- أفضل أوقات النشر (بناءً على بيانات الخوارزمية)
- نوع كل محتوى (تعليمي / ترفيهي / ترويجي / تفاعلي)
- نصيحة استراتيجية لهذا الأسبوع

أضف في النهاية: نسبة التوزيع المثالية بين أنواع المحتوى.`

    case 'hook':
      return `أنت متخصص في كتابة الـ Hooks التي تجعل المشاهدين يبقون في أول 3 ثواني.
${baseContext}

المطلوب: 10 Hooks قوية لفيديو حول "${topic}" لـ ${platformLabel}:

نوع 1 - السؤال الاستفزازي (3 خيارات)
نوع 2 - الادعاء الجريء أو الإحصاء الصادم (3 خيارات)
نوع 3 - وعد بفائدة واضحة (2 خيارات)
نوع 4 - قصة شخصية أو موقف (2 خيارات)

لكل Hook: اشرح لماذا يعمل نفسياً + في أي حالة تستخدمه.`

    case 'cta':
      return `أنت خبير في تحويل المشاهدين إلى متابعين ومشتركين.
${baseContext}

المطلوب: 10 CTAs فعّالة لاستخدامها في نهاية المحتوى:

**CTAs للاشتراك/المتابعة (3 خيارات):**
صياغات طبيعية وغير مبتذلة.

**CTAs للتفاعل (تعليقات / لايكات) (3 خيارات):**
أسئلة تحفز على التعليق.

**CTAs لمشاركة المحتوى (2 خيارات):**
سبب مقنع للمشاركة.

**CTAs للعروض أو الروابط (2 خيارات):**
صياغة للترويج للمنتجات/الخدمات.

أضف نصيحة: متى تضع CTA واحد ومتى تضع أكثر من واحد.`

    case 'article-to-script':
      if (!articleText) return 'يرجى إدخال نص المقال المراد تحويله.'
      return `أنت متخصص في تحويل المحتوى المكتوب إلى محتوى مرئي جذاب لـ ${platformLabel}.
${baseContext}

المقال الأصلي:
${articleText}

المطلوب: تحويل هذا المقال إلى سكربت فيديو ديناميكي لـ ${platformLabel} يشمل:
1. Hook قوية من محتوى المقال
2. إعادة هيكلة المعلومات بأسلوب شفهي طبيعي (لا نص رسمي)
3. إضافة انتقالات ("في الدقيقة التالية..." / "الآن دعني أخبرك...")
4. اقتراح توقيت لكل قسم
5. CTA مناسبة

الطول المستهدف: ${platform === 'youtube' ? '5-8 دقائق' : '60-90 ثانية'}.`

    case 'short-content':
      return `أنت متخصص في إنتاج المحتوى القصير الفيروسي للـ ${platform === 'instagram' ? 'Reels' : platform === 'youtube' ? 'Shorts' : 'TikTok'}.
${baseContext}

المطلوب: 5 أفكار محتوى قصير (15-60 ثانية) حول "${topic}":

لكل فكرة:
1. العنوان/الـ Hook الأولية (أول كلمة أو جملة)
2. الهيكل (ثانية 0-5 / 5-30 / 30-60)
3. الصوت المقترح (موسيقى / كلام / duet...)
4. النص الكامل أو النقاط الأساسية
5. الـ CTA النهائي

أضف نصيحة: ما يجعل هذا النوع من المحتوى يصبح فيروسياً.`

    default:
      return `أنت خبير سوشيال ميديا. ساعدني في إنشاء محتوى احترافي لـ ${platformLabel} حول "${topic}" في مجال "${niche}".`
  }
}

export const SOCIAL_SYSTEM_PROMPT = `أنت خبير استراتيجي في إنشاء المحتوى الرقمي لمنصات يوتيوب وتيك توك وإنستغرام.
تفهم خوارزميات كل منصة وكيفية إنشاء محتوى يحقق تفاعلاً حقيقياً.
تتحدث بلغة المنشئين وتعطي إجابات عملية وقابلة للتطبيق فوراً.
أسلوبك ديناميكي ومحفز.`
