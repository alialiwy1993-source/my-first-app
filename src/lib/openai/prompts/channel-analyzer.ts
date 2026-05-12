// =====================================================
// Channel Analyzer Studio Prompts
// =====================================================

export type ChannelPlatform = 'youtube' | 'tiktok' | 'instagram'

export interface ChannelAnalyzerInput {
  platform: ChannelPlatform
  channelName: string
  channelUrl?: string
  channelDescription?: string
  contentType?: string       // نوع المحتوى
  targetAudience?: string
  subscribersCount?: string  // عدد المشتركين/المتابعين
  averageViews?: string      // متوسط المشاهدات
  postingFrequency?: string  // تكرار النشر
  topVideos?: string         // أفضل الفيديوهات/المنشورات
  challenges?: string        // التحديات التي يواجهها المنشئ
}

const PLATFORM_LABELS: Record<ChannelPlatform, string> = {
  youtube:   'يوتيوب',
  tiktok:    'تيك توك',
  instagram: 'إنستغرام',
}

export function buildChannelAnalyzerPrompt(input: ChannelAnalyzerInput): string {
  const {
    platform, channelName, channelUrl, channelDescription,
    contentType, targetAudience, subscribersCount, averageViews,
    postingFrequency, topVideos, challenges,
  } = input

  const platformLabel = PLATFORM_LABELS[platform]

  const channelInfo = `
معلومات القناة:
- المنصة: ${platformLabel}
- اسم القناة: ${channelName}
${channelUrl ? `- رابط القناة: ${channelUrl}` : ''}
${channelDescription ? `- وصف القناة: ${channelDescription}` : ''}
${contentType ? `- نوع المحتوى: ${contentType}` : ''}
${targetAudience ? `- الجمهور المستهدف: ${targetAudience}` : ''}
${subscribersCount ? `- عدد المشتركين/المتابعين: ${subscribersCount}` : ''}
${averageViews ? `- متوسط المشاهدات: ${averageViews}` : ''}
${postingFrequency ? `- تكرار النشر: ${postingFrequency}` : ''}
${topVideos ? `- أفضل المحتوى: ${topVideos}` : ''}
${challenges ? `- التحديات الحالية: ${challenges}` : ''}`

  return `أنت محلل قنوات ومستشار نمو متخصص في ${platformLabel}.
${channelInfo}

المطلوب: تحليل شامل للقناة يشمل:

## 1. تحليل الهوية والمحتوى
- وضوح الهوية البصرية والرسالة
- مدى تميّز اسم القناة ومدى سهولة تذكره
- تقييم وصف القناة وكفاءته
- تحديد النيش/المجال وتحليل تنافسيته

## 2. تحليل الأداء
- تقييم نسبة التفاعل (Engagement Rate) بناءً على المعطيات المتاحة
- مقارنة بمعدلات المنصة المتوسطة
- تحليل نمط النشر وانتظامه

## 3. نقاط القوة ✅
قائمة تفصيلية بأبرز 5 نقاط قوة مع تفسير لماذا هي ميزة.

## 4. نقاط الضعف والفرص ⚠️
قائمة بـ 5 نقاط تحتاج تحسيناً مع اقتراح حل محدد لكل نقطة.

## 5. اقتراحات تحسين فورية (Quick Wins)
3-5 خطوات يمكن تطبيقها هذا الأسبوع لتحسين الأداء.

## 6. اقتراحات تحسين طويلة المدى
استراتيجية نمو لـ 3-6 أشهر.

## 7. أفكار محتوى مقترحة
10 أفكار محتوى مناسبة تحديداً لهذه القناة وجمهورها.

## 8. تحسين العناوين والكلمات المفتاحية
نصائح لتحسين SEO القناة على ${platformLabel}.

## 9. التقييم العام
نقاط من 10 في كل مجال:
- جودة المحتوى: /10
- استراتيجية النمو: /10
- التواصل مع الجمهور: /10
- التحسين للخوارزمية: /10

ملاحظة: هذا التحليل مبني على المعلومات المقدمة. للحصول على تحليل أدق، يفضل استخدام أدوات تحليل متخصصة مثل Social Blade أو YouTube Analytics الرسمي.`
}

export const CHANNEL_ANALYZER_SYSTEM_PROMPT = `أنت محلل قنوات ومستشار نمو خبير في منصات يوتيوب وتيك توك وإنستغرام.
تملك خبرة عميقة في فهم الخوارزميات واستراتيجيات النمو.
تحلل البيانات المقدمة وتقدم توصيات عملية ومحددة وقابلة للتطبيق.
أسلوبك احترافي ومبني على البيانات.`
