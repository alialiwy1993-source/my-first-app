// =====================================================
// Books & AI Tools Studio Prompts
// =====================================================

export type BooksToolsTool =
  | 'book-recommendations'
  | 'reading-plan'
  | 'book-summary'
  | 'extract-ideas'
  | 'ai-tools-directory'

export type BookField =
  | 'business' | 'tech' | 'self-help' | 'science' | 'history'
  | 'psychology' | 'marketing' | 'leadership' | 'finance' | 'philosophy'
  | 'education' | 'productivity' | 'creativity' | 'other'

export type AiToolCategory =
  | 'writing' | 'images' | 'video' | 'audio' | 'coding'
  | 'study' | 'business' | 'marketing'

export interface BooksToolsInput {
  tool: BooksToolsTool
  field?: BookField
  bookTitle?: string
  bookText?: string           // النص المراد تلخيصه
  readingGoal?: string        // هدف القراءة
  booksPerMonth?: number
  aiToolCategory?: AiToolCategory
  language?: 'ar' | 'en'
  userLevel?: 'beginner' | 'intermediate' | 'advanced'
}

export const BOOK_FIELD_LABELS: Record<BookField, string> = {
  business:    'الأعمال وريادة الأعمال',
  tech:        'التقنية والبرمجة',
  'self-help': 'تطوير الذات',
  science:     'العلوم',
  history:     'التاريخ والحضارات',
  psychology:  'علم النفس',
  marketing:   'التسويق والإعلان',
  leadership:  'القيادة والإدارة',
  finance:     'المال والاستثمار',
  philosophy:  'الفلسفة والفكر',
  education:   'التربية والتعليم',
  productivity: 'الإنتاجية وإدارة الوقت',
  creativity:  'الإبداع والفنون',
  other:       'مجالات أخرى',
}

export const AI_TOOL_CATEGORY_LABELS: Record<AiToolCategory, string> = {
  writing:   'الكتابة والمحتوى',
  images:    'توليد الصور',
  video:     'إنشاء الفيديو',
  audio:     'الصوت والموسيقى',
  coding:    'البرمجة والكود',
  study:     'الدراسة والتعلم',
  business:  'الأعمال والإنتاجية',
  marketing: 'التسويق وسوشيال ميديا',
}

export function buildBooksToolsPrompt(input: BooksToolsInput): string {
  const {
    tool, field, bookTitle, bookText, readingGoal,
    booksPerMonth = 2, aiToolCategory, language = 'ar', userLevel = 'intermediate',
  } = input

  const fieldLabel = field ? BOOK_FIELD_LABELS[field] : ''
  const lang = language === 'ar' ? 'العربية' : 'الإنجليزية'

  switch (tool) {
    case 'book-recommendations':
      return `أنت مستشار قراءة خبير ومطّلع على أهم الكتب العالمية والعربية.

المجال: ${fieldLabel}
مستوى القارئ: ${userLevel === 'beginner' ? 'مبتدئ' : userLevel === 'intermediate' ? 'متوسط' : 'متقدم'}
${readingGoal ? `هدف القراءة: ${readingGoal}` : ''}
لغة الكتب المفضلة: ${lang}

المطلوب: قائمة بـ 12 كتاباً موصى به في مجال "${fieldLabel}":

قسّمها إلى:
**للمبتدئين (4 كتب):**
لكل كتاب: العنوان + المؤلف + سنة النشر + لماذا هذا الكتاب مناسب + الفكرة الرئيسية في جملة.

**للمتوسطين (4 كتب):**
نفس التفاصيل.

**للمتقدمين (4 كتب):**
نفس التفاصيل.

**كتاب الشهر الموصى به:**
اختر واحداً واشرح لماذا هو الأهم في هذه المرحلة.

ملاحظة: اذكر الكتب الحقيقية الموجودة فعلاً مع بياناتها الصحيحة.`

    case 'reading-plan':
      return `أنت مدرب قراءة متخصص في تصميم خطط القراءة الفعّالة.

المجال: ${fieldLabel}
${readingGoal ? `هدف القراءة: ${readingGoal}` : ''}
عدد الكتب المستهدفة شهرياً: ${booksPerMonth}
المستوى: ${userLevel === 'beginner' ? 'مبتدئ' : userLevel === 'intermediate' ? 'متوسط' : 'متقدم'}

المطلوب: خطة قراءة منظمة لمدة 3 أشهر تشمل:

## الأشهر الثلاثة
لكل شهر:
- الكتاب/الكتب المقترحة (مع مبرر الاختيار)
- الهدف من هذا الكتاب
- أسلوب القراءة الموصى به (سريع / تأملي / تحليلي)
- عدد الصفحات اليومي المقترح
- أسئلة للتفكير أثناء القراءة

## نصائح لتحقيق الاستمرارية
5 نصائح عملية للالتزام بالخطة.

## طريقة حفظ الأفكار
كيفية تدوين الملاحظات واستخدام ما تقرأه.

## الوقت المقترح للقراءة
متى وكيف تجد الوقت للقراءة في جداول مشغولة.`

    case 'book-summary':
      if (!bookText && !bookTitle) return 'يرجى إدخال نص الكتاب أو عنوانه.'
      if (bookText) {
        return `أنت متخصص في تلخيص الكتب وتحليل الأفكار.

الكتاب: ${bookTitle || 'النص المقدم'}
المجال: ${fieldLabel || 'عام'}

النص:
${bookText}

المطلوب: ملخص تحليلي شامل يشمل:

## الملخص الموجز (200-300 كلمة)
الفكرة الرئيسية والرسالة الجوهرية للكتاب.

## النقاط الرئيسية
5-8 أفكار أساسية من الكتاب مرتبة بأهميتها.

## أهم الاقتباسات أو المفاهيم
من النص المقدم.

## التطبيق العملي
كيف يمكن تطبيق أفكار هذا الكتاب في الحياة/العمل؟

## التقييم
نقاط القوة والضعف في الأفكار المطروحة.`
      }
      return `أنت متخصص في تلخيص الكتب الشهيرة.

اسم الكتاب: ${bookTitle}
${fieldLabel ? `المجال: ${fieldLabel}` : ''}

المطلوب: ملخص شامل لكتاب "${bookTitle}" يشمل:

## عن الكتاب
المؤلف + سنة النشر + سبب شهرته وتأثيره.

## الفكرة المحورية
الرسالة الأساسية في فقرة.

## الأفكار الرئيسية (7-10 نقاط)
أهم ما في الكتاب بترتيب منطقي مع شرح لكل نقطة.

## أبرز الدروس العملية
5 دروس يمكن تطبيقها فوراً.

## اقتباسات مشهورة من الكتاب
أشهر 3-5 اقتباسات.

## لمن يُنصح بهذا الكتاب؟
وصف الشخص الذي سيستفيد أكثر.`

    case 'extract-ideas':
      if (!bookTitle && !bookText) return 'يرجى إدخال عنوان الكتاب أو نص منه.'
      const sourceText = bookText || `كتاب "${bookTitle}"`
      return `أنت محلل أفكار ومستخرج رؤى متخصص.

المصدر: ${sourceText.length > 200 ? 'النص المقدم' : sourceText}
${bookText && bookText.length > 200 ? `\nالنص:\n${bookText}` : ''}
${fieldLabel ? `المجال: ${fieldLabel}` : ''}

المطلوب: استخراج الأفكار القابلة للتطبيق بتنسيق عملي:

## الأفكار الثورية (Big Ideas)
3-5 أفكار كبيرة ستغير طريقة تفكيرك.

## الإطار العملي (Frameworks)
نماذج أو أطر عمل مذكورة في الكتاب يمكن تطبيقها.

## الأفكار القابلة للتطبيق الفوري
10 أفكار عملية مع خطوة تطبيق واحدة لكل منها.

## الأسئلة التأملية
5 أسئلة تدفعك للتأمل بناءً على محتوى الكتاب.

## ربط الأفكار بالواقع
كيف تنطبق هذه الأفكار على الحياة المعاصرة والسياق العربي؟`

    case 'ai-tools-directory':
      const categoryLabel = aiToolCategory ? AI_TOOL_CATEGORY_LABELS[aiToolCategory] : 'جميع المجالات'
      return `أنت خبير في أدوات الذكاء الاصطناعي ومتابع لأحدث التطورات في هذا المجال.

المجال المطلوب: ${categoryLabel}
مستوى المستخدم: ${userLevel === 'beginner' ? 'مبتدئ' : userLevel === 'intermediate' ? 'متوسط' : 'متقدم'}

المطلوب: دليل شامل لأفضل أدوات الذكاء الاصطناعي في مجال "${categoryLabel}":

لكل أداة اذكر:
1. **اسم الأداة** + رابطها (URL)
2. **وصف موجز**: ماذا تفعل في جملة أو جملتين
3. **أبرز الميزات**: 3-5 ميزات رئيسية
4. **الخطة المجانية**: هل توجد؟ وما حدودها؟
5. **السعر التقريبي**: للخطة المدفوعة
6. **الأنسب لـ**: نوع المستخدم الذي سيستفيد أكثر
7. **التقييم**: ★★★★★ (من 5)

قدّم 8-10 أدوات مرتبة من الأفضل للأقل، مع التنويع بين المجاني والمدفوع.

أضف في النهاية:
- **نصيحة الخبير**: كيف تختار الأداة المناسبة لاحتياجاتك
- **مقارنة سريعة**: جدول مقارنة بين أهم 3-4 أدوات

ملاحظة: تأكد من ذكر أدوات موجودة فعلاً وبيانات دقيقة.`

    default:
      return `ساعدني في اكتشاف الكتب وأدوات الذكاء الاصطناعي المناسبة لاحتياجاتي.`
  }
}

export const BOOKS_TOOLS_SYSTEM_PROMPT = `أنت مستشار ثقافي وتقني متخصص في الكتب وأدوات الذكاء الاصطناعي.
تملك إطلاعاً واسعاً على الكتب في مختلف المجالات، وخبرة في تقييم أدوات AI.
تقدم توصيات مخصصة وعملية تناسب احتياجات المستخدم.
أسلوبك محفز ومشجع على التعلم والاستكشاف.`
