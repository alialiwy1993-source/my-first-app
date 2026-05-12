// =====================================================
// Mock AI Provider — ردود تجريبية بدون OpenAI API
// يُستخدم عندما AI_PROVIDER=mock أو عندما يفشل OpenAI
// =====================================================

/**
 * هل الـ Mock mode مفعّل؟
 */
export function isMockMode(): boolean {
  return process.env.AI_PROVIDER === 'mock' || !process.env.OPENAI_API_KEY
}

/**
 * رد تجريبي لكل استوديو
 */
export function getMockResponse(studio: string, input: Record<string, unknown>): string {
  const responses: Record<string, () => string> = {
    articles: () => getMockArticle(input),
    translation: () => getMockTranslation(input),
    research: () => getMockResearch(input),
    social: () => getMockSocial(input),
    'channel-analyzer': () => getMockChannelAnalysis(input),
    thumbnails: () => getMockThumbnail(input),
    'books-tools': () => getMockBooksTools(input),
    video: () => getMockVideo(input),
  }

  return responses[studio]?.() ?? getGenericMockResponse(studio, input)
}

/**
 * رد Chat تجريبي (streaming)
 */
export function getMockChatResponse(message: string, assistantType: string): string {
  const typeResponses: Record<string, string> = {
    general: `مرحباً! هذا رد تجريبي (Demo Mode) 🎭

سؤالك كان: "${message.slice(0, 100)}"

في الوضع الحقيقي، ستحصل على إجابة ذكية من GPT-4o-mini. لتفعيل الذكاء الاصطناعي الحقيقي:
1. أضف مفتاح OpenAI API في \`.env.local\`
2. غيّر \`AI_PROVIDER=openai\`
3. أعد تشغيل المشروع

---
*هذا رد تجريبي من Demo Mode*`,

    coder: `\`\`\`typescript
// هذا رد تجريبي من Demo Mode 🎭
// سؤالك: "${message.slice(0, 80)}"

function exampleFunction() {
  console.log("مرحباً! هذا كود تجريبي")
  // في الوضع الحقيقي ستحصل على كود فعلي من AI
  return "demo response"
}
\`\`\`

لتفعيل المساعد الحقيقي، أضف مفتاح OpenAI API.

*هذا رد تجريبي من Demo Mode*`,

    business: `## تحليل تجريبي 📊

سؤالك: "${message.slice(0, 80)}"

### النقاط الرئيسية:
- نقطة أولى تجريبية
- نقطة ثانية تجريبية  
- نقطة ثالثة تجريبية

### التوصية:
هذا محتوى تجريبي. في الوضع الحقيقي ستحصل على تحليل أعمال متكامل.

*Demo Mode — أضف OPENAI_API_KEY لتفعيل AI الحقيقي*`,

    study: `## شرح تجريبي 🎓

سؤالك: "${message.slice(0, 80)}"

### المفهوم:
هذا شرح تجريبي. في الوضع الحقيقي ستحصل على شرح أكاديمي مفصّل.

### أمثلة:
1. مثال أول
2. مثال ثاني
3. مثال ثالث

*Demo Mode — أضف OPENAI_API_KEY لتفعيل AI الحقيقي*`,

    writing: `## نص تجريبي ✍️

بناءً على طلبك: "${message.slice(0, 80)}"

هذا نص تجريبي يمثل ما ستحصل عليه من مساعد الكتابة. في الوضع الحقيقي ستحصل على محتوى احترافي مخصص.

*Demo Mode*`,

    marketing: `## محتوى تسويقي تجريبي 📣

طلبك: "${message.slice(0, 80)}"

### العنوان:
عنوان تسويقي جذاب تجريبي

### النص:
هذا محتوى تسويقي تجريبي. أضف مفتاح OpenAI للحصول على محتوى حقيقي.

*Demo Mode*`,
  }

  return typeResponses[assistantType] ?? typeResponses.general
}

// =====================================================
// Mock responses لكل استوديو
// =====================================================

function getMockArticle(input: Record<string, unknown>): string {
  const topic = String(input.topic ?? 'موضوع تجريبي')
  const type = String(input.type ?? 'general')
  
  return `# ${topic}

## مقدمة
هذا مقال تجريبي (Demo Mode) حول "${topic}". في الوضع الحقيقي ستحصل على مقال احترافي كامل من AI.

## النقاط الرئيسية

### 1. النقطة الأولى
محتوى تجريبي يشرح النقطة الأولى بتفصيل.

### 2. النقطة الثانية
محتوى تجريبي يشرح النقطة الثانية بتفصيل.

### 3. النقطة الثالثة
محتوى تجريبي يشرح النقطة الثالثة بتفصيل.

## الخلاصة
هذا المقال من نوع "${type}" — تجريبي. أضف مفتاح OpenAI API للحصول على مقالات حقيقية.

---
*🎭 Demo Mode — AI_PROVIDER=mock*
*عدد الكلمات التقريبي: ~150 كلمة*`
}

function getMockTranslation(input: Record<string, unknown>): string {
  const text = String(input.text ?? 'نص تجريبي')
  const mode = String(input.mode ?? 'translate')
  const target = String(input.targetLanguage ?? 'en')
  
  if (mode === 'detect-errors') {
    return `## فحص الأخطاء (Demo Mode) 🎭

**النص الأصلي:** ${text.slice(0, 200)}

### الأخطاء المكتشفة:
1. ❌ خطأ تجريبي #1 — هذا مجرد عرض توضيحي
2. ❌ خطأ تجريبي #2 — أضف OpenAI API لفحص حقيقي

### النص المصحّح:
${text.slice(0, 200)} [مصحّح تجريبياً]

*Demo Mode — أضف OPENAI_API_KEY لتفعيل الفحص الحقيقي*`
  }
  
  if (mode === 'rephrase') {
    return `## إعادة الصياغة (Demo Mode) 🎭

**النص الأصلي:** ${text.slice(0, 200)}

**النص المُعاد صياغته:**
[هنا ستظهر إعادة الصياغة الاحترافية عند تفعيل OpenAI API]

${text.slice(0, 100)}... (نسخة تجريبية)

*Demo Mode*`
  }
  
  return `## الترجمة (Demo Mode) 🎭

**النص الأصلي:**
${text.slice(0, 300)}

**الترجمة إلى ${target === 'en' ? 'الإنجليزية' : target === 'ar' ? 'العربية' : target}:**
[This is a demo translation. Add OpenAI API key for real translations.]

"${text.slice(0, 100)}..." → [Demo translated text]

*Demo Mode — أضف OPENAI_API_KEY لترجمة حقيقية*`
}

function getMockResearch(input: Record<string, unknown>): string {
  const title = String(input.title ?? 'بحث تجريبي')
  const tool = String(input.tool ?? 'research-plan')
  const level = String(input.level ?? 'master')
  
  return `# ${title} (Demo Mode) 🎭

## ${tool === 'research-plan' ? 'خطة البحث' : tool === 'methodology' ? 'المنهجية' : 'نتيجة البحث'}

### معلومات البحث:
- **المستوى:** ${level === 'master' ? 'ماجستير' : level === 'phd' ? 'دكتوراه' : 'بكالوريوس'}
- **العنوان:** ${title}

### المحتوى التجريبي:

#### 1. القسم الأول
محتوى أكاديمي تجريبي. في الوضع الحقيقي ستحصل على إرشاد أكاديمي مفصّل.

#### 2. القسم الثاني
محتوى تجريبي إضافي يوضح هيكل الإخراج المتوقع.

#### 3. القسم الثالث
خاتمة تجريبية.

---
⚠️ *تنبيه: هذا محتوى تجريبي. أضف OpenAI API للحصول على إرشاد أكاديمي حقيقي.*
*Demo Mode — AI_PROVIDER=mock*`
}

function getMockSocial(input: Record<string, unknown>): string {
  const topic = String(input.topic ?? 'محتوى تجريبي')
  const platform = String(input.platform ?? 'youtube')
  const tool = String(input.tool ?? 'content-ideas')
  
  return `# ${tool === 'content-ideas' ? 'أفكار محتوى' : tool === 'video-script' ? 'سكربت فيديو' : 'محتوى سوشيال'} (Demo Mode) 🎭

**المنصة:** ${platform}
**الموضوع:** ${topic}

## النتيجة التجريبية:

### فكرة 1: ${topic} — الجزء الأول
وصف تجريبي للفكرة الأولى.

### فكرة 2: ${topic} — نظرة مختلفة
وصف تجريبي للفكرة الثانية.

### فكرة 3: أسرار ${topic}
وصف تجريبي للفكرة الثالثة.

### هاشتاقات تجريبية:
#تجريبي #demo #محتوى #سوشيال_ميديا

---
*Demo Mode — أضف OPENAI_API_KEY لمحتوى حقيقي*`
}

function getMockChannelAnalysis(input: Record<string, unknown>): string {
  const name = String(input.channelName ?? 'قناة تجريبية')
  const platform = String(input.platform ?? 'youtube')
  
  return `# تحليل قناة "${name}" (Demo Mode) 🎭

**المنصة:** ${platform}

## 1. نظرة عامة
هذا تحليل تجريبي. في الوضع الحقيقي ستحصل على تحليل شامل ومفصّل.

## 2. نقاط القوة ✅
- نقطة قوة تجريبية #1
- نقطة قوة تجريبية #2
- نقطة قوة تجريبية #3

## 3. نقاط الضعف ⚠️
- نقطة ضعف تجريبية #1
- نقطة ضعف تجريبية #2

## 4. اقتراحات تحسين
1. اقتراح تجريبي أول
2. اقتراح تجريبي ثاني
3. اقتراح تجريبي ثالث

## 5. التقييم العام
- جودة المحتوى: 7/10
- استراتيجية النمو: 6/10
- التفاعل: 8/10

---
*Demo Mode — أضف OPENAI_API_KEY لتحليل حقيقي*`
}

function getMockThumbnail(input: Record<string, unknown>): string {
  const title = String(input.videoTitle ?? 'فيديو تجريبي')
  const tool = String(input.tool ?? 'ideas')
  
  return `# أفكار صور مصغرة لـ "${title}" (Demo Mode) 🎭

## الفكرة 1: التصميم الجريء
- **الوصف:** خلفية ملونة مع نص كبير وعريض
- **النص على الصورة:** "${title.slice(0, 20)}..."
- **الألوان:** أحمر + أبيض على خلفية سوداء

## الفكرة 2: الوجه + العاطفة
- **الوصف:** صورة وجه مع تعبير مفاجأة
- **النص:** 3-4 كلمات فقط
- **الألوان:** أزرق + أصفر

## الفكرة 3: البساطة
- **الوصف:** تصميم بسيط مع أيقونة واحدة كبيرة
- **النص:** كلمتين فقط بخط عريض
- **الألوان:** أبيض على تدرج داكن

${tool === 'image-prompt' ? `
## Prompt لتوليد الصورة:
"A bold YouTube thumbnail design about ${title}, high contrast, eye-catching, with large text"
` : ''}

---
*Demo Mode — أضف OPENAI_API_KEY لأفكار حقيقية*`
}

function getMockBooksTools(input: Record<string, unknown>): string {
  const tool = String(input.tool ?? 'book-recommendations')
  const field = String(input.field ?? 'business')
  
  if (tool === 'ai-tools-directory') {
    return `# دليل أدوات AI (Demo Mode) 🎭

## 1. ChatGPT
- **الرابط:** chat.openai.com
- **الوصف:** مساعد ذكاء اصطناعي شامل
- **مجاني:** جزئياً

## 2. Midjourney
- **الرابط:** midjourney.com
- **الوصف:** توليد صور إبداعية
- **مجاني:** لا

## 3. Perplexity
- **الرابط:** perplexity.ai
- **الوصف:** بحث ذكي بمصادر
- **مجاني:** نعم

---
*Demo Mode — أضف OPENAI_API_KEY لقائمة شاملة ومحدّثة*`
  }
  
  return `# اقتراحات كتب في مجال "${field}" (Demo Mode) 🎭

## للمبتدئين:
1. **كتاب تجريبي #1** — مؤلف تجريبي (2020)
2. **كتاب تجريبي #2** — مؤلف تجريبي (2019)

## للمتوسطين:
3. **كتاب تجريبي #3** — مؤلف تجريبي (2021)
4. **كتاب تجريبي #4** — مؤلف تجريبي (2022)

## للمتقدمين:
5. **كتاب تجريبي #5** — مؤلف تجريبي (2023)

---
*Demo Mode — أضف OPENAI_API_KEY لاقتراحات كتب حقيقية*`
}

function getMockVideo(input: Record<string, unknown>): string {
  const idea = String(input.idea ?? 'فكرة فيديو تجريبية')
  const platform = String(input.platform ?? 'youtube')
  const duration = String(input.duration ?? '5min')
  
  return `# سكربت فيديو: "${idea}" (Demo Mode) 🎭

**المنصة:** ${platform} | **المدة:** ${duration}

## 1. 🪝 الـ Hook (أول 5 ثواني)
"هل تعلم أن... [hook تجريبي لجذب الانتباه]"

## 2. 📜 السكربت
مرحباً بكم! اليوم سنتحدث عن ${idea}.

[هنا يكون السكربت الكامل في الوضع الحقيقي]

النقطة الأولى...
النقطة الثانية...
الخلاصة...

## 3. 🎬 المشاهد
| # | الوقت | الوصف | النص |
|---|-------|-------|------|
| 1 | 0:00-0:05 | Hook | جملة جذب |
| 2 | 0:05-0:30 | مقدمة | تعريف |
| 3 | 0:30-2:00 | المحتوى | الشرح |
| 4 | 2:00-2:30 | خاتمة | CTA |

## 4. 📝 وصف الفيديو
${idea} — شرح مبسّط ومفيد! 🎯

## 5. 🎯 عناوين مقترحة
1. "${idea} — ما لا يخبرك به أحد!"
2. "كل ما تحتاج معرفته عن ${idea}"
3. "${idea} في 5 دقائق"

## 6. #️⃣ هاشتاقات
#تجريبي #demo #فيديو #محتوى

---
*Demo Mode — أضف OPENAI_API_KEY لسكربت حقيقي ومفصّل*`
}

function getGenericMockResponse(studio: string, input: Record<string, unknown>): string {
  return `# نتيجة تجريبية — ${studio} (Demo Mode) 🎭

هذا رد تجريبي من استوديو "${studio}".

**البيانات المُدخلة:**
${JSON.stringify(input, null, 2).slice(0, 500)}

في الوضع الحقيقي ستحصل على نتيجة احترافية من AI.

---
*لتفعيل AI الحقيقي:*
1. *أضف \`OPENAI_API_KEY\` في \`.env.local\`*
2. *غيّر \`AI_PROVIDER=openai\`*
3. *أعد التشغيل*`
}
