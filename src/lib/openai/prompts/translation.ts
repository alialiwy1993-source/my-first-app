export interface TranslationInput {
  text: string
  sourceLanguage: string
  targetLanguage: string
  type: 'general' | 'academic' | 'marketing' | 'technical' | 'literary' | 'official'
  mode?: 'translate' | 'improve' | 'rephrase' | 'detect-errors'
}

const TYPE_LABELS: Record<TranslationInput['type'], string> = {
  general: 'ترجمة عامة',
  academic: 'ترجمة أكاديمية',
  marketing: 'ترجمة تسويقية',
  technical: 'ترجمة تقنية',
  literary: 'ترجمة أدبية',
  official: 'ترجمة رسمية',
}

export function buildTranslationPrompt(input: TranslationInput): string {
  const { text, sourceLanguage, targetLanguage, type, mode = 'translate' } = input

  if (mode === 'improve') {
    return `حسّن الترجمة التالية من ${sourceLanguage} إلى ${targetLanguage}:

النص:
${text}

المطلوب:
- تحسين الأسلوب والسلاسة
- الحفاظ على المعنى الأصلي
- استخدام المصطلحات الأنسب
- التنسيق: قدّم الترجمة المحسّنة مباشرة، ثم اشرح التحسينات`
  }

  if (mode === 'rephrase') {
    return `أعد صياغة النص التالي بأسلوب أكثر احترافية:

النص:
${text}

المطلوب:
- أسلوب احترافي راقٍ
- وضوح وإيجاز
- سلامة لغوية تامة`
  }

  if (mode === 'detect-errors') {
    return `افحص النص التالي وحدّد الأخطاء اللغوية والأسلوبية:

النص:
${text}

المطلوب:
- قائمة بالأخطاء النحوية والإملائية
- قائمة بالأخطاء الأسلوبية
- النص المصحّح
- شرح كل تصحيح`
  }

  return `ترجم النص التالي من ${sourceLanguage} إلى ${targetLanguage} (${TYPE_LABELS[type]}):

النص المراد ترجمته:
${text}

متطلبات الترجمة:
- ترجمة دقيقة ومفيدة
- الحفاظ على المعنى والأسلوب
${type === 'academic' ? '- استخدام المصطلحات الأكاديمية الدقيقة\n- أسلوب رسمي محكم' : ''}
${type === 'marketing' ? '- أسلوب مقنع وجذاب\n- مناسب للجمهور المستهدف' : ''}
${type === 'technical' ? '- دقة في المصطلحات التقنية\n- الحفاظ على أسماء المنتجات والعلامات التجارية' : ''}
${type === 'literary' ? '- الحفاظ على الأسلوب الأدبي والجمالي\n- الانتباه للإيقاع والأسلوب' : ''}
- قدّم الترجمة مباشرة بدون مقدمات`
}

export const TRANSLATION_SYSTEM_PROMPT = `أنت مترجم محترف متخصص في الترجمة بين العربية والإنجليزية وغيرها من اللغات.
تتقن أنواع الترجمة المختلفة: العامة، الأكاديمية، التسويقية، التقنية، الأدبية، الرسمية.
الترجمة دقيقة وطبيعية لا تبدو آلية.
انتبه للسياق والمعنى لا للمعنى الحرفي فقط.`
