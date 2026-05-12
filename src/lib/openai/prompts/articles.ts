export interface ArticleInput {
  topic: string
  type: 'general' | 'seo' | 'technical' | 'marketing' | 'educational' | 'opinion'
  tone: 'professional' | 'casual' | 'academic' | 'persuasive' | 'informative'
  length: 'short' | 'medium' | 'long'
  keywords?: string
  targetAudience?: string
}

const TYPE_LABELS: Record<ArticleInput['type'], string> = {
  general: 'مقال عام',
  seo: 'مقال محسّن لمحركات البحث (SEO)',
  technical: 'مقال تقني',
  marketing: 'مقال تسويقي',
  educational: 'مقال تعليمي',
  opinion: 'مقال رأي وتحليل',
}

const TONE_LABELS: Record<ArticleInput['tone'], string> = {
  professional: 'احترافي',
  casual: 'غير رسمي وقريب من القارئ',
  academic: 'أكاديمي رسمي',
  persuasive: 'إقناعي',
  informative: 'إخباري موضوعي',
}

const LENGTH_MAP: Record<ArticleInput['length'], string> = {
  short: '300 إلى 500 كلمة',
  medium: '600 إلى 900 كلمة',
  long: '1000 إلى 1500 كلمة',
}

export function buildArticlePrompt(input: ArticleInput): string {
  const {
    topic,
    type,
    tone,
    length,
    keywords,
    targetAudience,
  } = input

  let prompt = `اكتب ${TYPE_LABELS[type]} عن الموضوع التالي:

**الموضوع:** ${topic}
**الأسلوب:** ${TONE_LABELS[tone]}
**الطول المطلوب:** ${LENGTH_MAP[length]}`

  if (keywords) {
    prompt += `\n**الكلمات المفتاحية:** ${keywords}`
  }

  if (targetAudience) {
    prompt += `\n**الجمهور المستهدف:** ${targetAudience}`
  }

  if (type === 'seo') {
    prompt += `

متطلبات SEO:
- ابدأ بمقدمة جذابة تحتوي على الكلمة المفتاحية الرئيسية
- استخدم عناوين H2 وH3 بشكل منطقي
- أضف قائمة بالنقاط الرئيسية
- اختم بـ call-to-action
- استخدم الكلمات المفتاحية بشكل طبيعي (لا تكرارها بشكل مبالغ)`
  }

  prompt += `

متطلبات التنسيق:
- استخدم Markdown للتنسيق
- أضف عنواناً رئيسياً جذاباً
- قسّم المحتوى بعناوين فرعية
- اجعل الفقرات قصيرة وسهلة القراءة
- الكتابة باللغة العربية الفصحى`

  return prompt
}

export const ARTICLES_SYSTEM_PROMPT = `أنت كاتب محتوى عربي محترف ومتخصص في كتابة المقالات الاحترافية والتسويقية والتقنية.
تكتب بأسلوب واضح ومنظم مع مراعاة SEO عند الطلب.
استخدم Markdown دائماً للتنسيق.
المقالات يجب أن تكون أصيلة وجذابة ومفيدة للقارئ.`
