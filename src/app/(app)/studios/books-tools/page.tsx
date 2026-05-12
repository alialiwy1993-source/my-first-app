'use client'

import { useState } from 'react'
import StudioLayout, { StudioFormPanel, StudioResultPanel } from '@/components/studios/StudioLayout'
import GenerationResult from '@/components/studios/GenerationResult'
import GenerationHistory from '@/components/studios/GenerationHistory'
import { useGeneration } from '@/hooks/useGeneration'
import { getStudio } from '@/lib/constants/studios'
import { cn } from '@/lib/utils'
import { BOOK_FIELD_LABELS, AI_TOOL_CATEGORY_LABELS, type BooksToolsTool, type BookField, type AiToolCategory } from '@/lib/openai/prompts/books-tools'

// =====================================================
// بيانات ثابتة
// =====================================================
const BOOK_TOOLS: { value: BooksToolsTool; label: string; icon: string; desc: string }[] = [
  { value: 'book-recommendations', label: 'اقتراح كتب',     icon: '📚', desc: 'قائمة بأفضل الكتب في مجالك' },
  { value: 'reading-plan',         label: 'خطة قراءة',      icon: '📅', desc: 'خطة 3 أشهر منظمة ومتدرجة' },
  { value: 'book-summary',         label: 'تلخيص كتاب',     icon: '📖', desc: 'ملخص شامل مع الأفكار الرئيسية' },
  { value: 'extract-ideas',        label: 'استخراج أفكار',  icon: '💡', desc: 'أفكار قابلة للتطبيق من الكتاب' },
  { value: 'ai-tools-directory',   label: 'دليل أدوات AI',  icon: '🤖', desc: 'أفضل أدوات AI في أي مجال' },
]

const FIELDS: { value: BookField; label: string }[] = Object.entries(BOOK_FIELD_LABELS).map(
  ([k, v]) => ({ value: k as BookField, label: v })
)

const AI_CATEGORIES: { value: AiToolCategory; label: string; icon: string }[] = [
  { value: 'writing',   label: 'كتابة',     icon: '✍️' },
  { value: 'images',    label: 'صور',       icon: '🎨' },
  { value: 'video',     label: 'فيديو',     icon: '🎥' },
  { value: 'audio',     label: 'صوت',       icon: '🔊' },
  { value: 'coding',    label: 'برمجة',     icon: '💻' },
  { value: 'study',     label: 'دراسة',     icon: '🎓' },
  { value: 'business',  label: 'أعمال',     icon: '💼' },
  { value: 'marketing', label: 'تسويق',     icon: '📣' },
]

const LEVELS = [
  { value: 'beginner',     label: 'مبتدئ' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'advanced',     label: 'متقدم' },
] as const

// الأدوات التي تحتاج نص كتاب
const BOOK_TEXT_TOOLS: BooksToolsTool[] = ['book-summary', 'extract-ideas']

export default function BooksToolsStudioPage() {
  const studio = getStudio('books-tools')!

  const [tool, setTool]             = useState<BooksToolsTool>('book-recommendations')
  const [field, setField]           = useState<BookField>('business')
  const [bookTitle, setBookTitle]   = useState('')
  const [bookText, setBookText]     = useState('')
  const [readingGoal, setReadingGoal] = useState('')
  const [booksPerMonth, setBooksPerMonth] = useState(2)
  const [aiCategory, setAiCategory] = useState<AiToolCategory>('writing')
  const [userLevel, setUserLevel]   = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')
  const [activeTab, setActiveTab]   = useState<'generate' | 'history'>('generate')

  const { result, isLoading, error, generate, reset } = useGeneration({ studioSlug: 'books-tools' })

  const isAiTool    = tool === 'ai-tools-directory'
  const needsText   = BOOK_TEXT_TOOLS.includes(tool)
  const isBookTool  = !isAiTool

  const canGenerate = (() => {
    if (isAiTool) return true
    if (needsText) return bookTitle.trim() || bookText.trim()
    return true  // recommendations + reading-plan always available
  })()

  const handleGenerate = async () => {
    if (!canGenerate) return
    await generate({
      tool,
      field: isAiTool ? undefined : field,
      bookTitle: bookTitle.trim() || undefined,
      bookText: needsText && bookText.trim() ? bookText.trim() : undefined,
      readingGoal: readingGoal.trim() || undefined,
      booksPerMonth,
      aiToolCategory: isAiTool ? aiCategory : undefined,
      userLevel,
      language: 'ar',
    })
  }

  return (
    <StudioLayout studio={studio} layout="split">
      <StudioFormPanel title="إعدادات الاستوديو">

        {/* Tool selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">اختر الأداة</label>
          <div className="space-y-1.5">
            {BOOK_TOOLS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTool(t.value)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-right transition-all',
                  tool === t.value
                    ? 'border-lime-500/50 bg-lime-500/15'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                )}
              >
                <span className="text-xl flex-shrink-0">{t.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-xs font-medium', tool === t.value ? 'text-white' : 'text-slate-300')}>
                    {t.label}
                  </p>
                  <p className="text-[10px] text-slate-500">{t.desc}</p>
                </div>
                {tool === t.value && (
                  <span className="text-lime-400 text-sm flex-shrink-0">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Level */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">مستواك</label>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                onClick={() => setUserLevel(l.value)}
                className={cn(
                  'rounded-lg border py-2 text-xs font-medium transition-all',
                  userLevel === l.value
                    ? 'border-lime-500/50 bg-lime-500/15 text-white'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── دليل أدوات AI ── */}
        {isAiTool && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">مجال الأداة</label>
            <div className="grid grid-cols-2 gap-1.5">
              {AI_CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setAiCategory(c.value)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all',
                    aiCategory === c.value
                      ? 'border-lime-500/50 bg-lime-500/15 text-white'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                  )}
                >
                  <span>{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── كتب: المجال ── */}
        {isBookTool && !needsText && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">المجال</label>
            <select
              value={field}
              onChange={(e) => setField(e.target.value as BookField)}
              className="input-base"
            >
              {FIELDS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* ── هدف القراءة (خطة القراءة) ── */}
        {tool === 'reading-plan' && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">هدف القراءة</label>
              <input
                type="text"
                value={readingGoal}
                onChange={(e) => setReadingGoal(e.target.value)}
                placeholder="مثال: تطوير مهارات القيادة، تعلم الاستثمار..."
                className="input-base"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">
                عدد الكتب شهرياً: <span className="text-white font-bold">{booksPerMonth}</span>
              </label>
              <input
                type="range"
                min={1}
                max={6}
                value={booksPerMonth}
                onChange={(e) => setBooksPerMonth(Number(e.target.value))}
                className="w-full accent-lime-500"
              />
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>1 كتاب</span>
                <span>6 كتب</span>
              </div>
            </div>
          </>
        )}

        {/* ── عنوان الكتاب (تلخيص / استخراج أفكار) ── */}
        {needsText && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">
                اسم الكتاب <span className="text-slate-600">(اختياري إذا أدخلت النص)</span>
              </label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="مثال: Thinking Fast and Slow"
                className="input-base"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400">
                  نص من الكتاب <span className="text-slate-600">(اختياري)</span>
                </label>
                <span className="text-[10px] text-slate-600">{bookText.length}/5000</span>
              </div>
              <textarea
                value={bookText}
                onChange={(e) => setBookText(e.target.value)}
                placeholder="الصق مقتطفاً أو فصلاً من الكتاب هنا للتحليل الدقيق..."
                rows={5}
                className="input-base resize-none"
                maxLength={5000}
              />
            </div>
          </>
        )}

        {/* Generate */}
        <button
          onClick={handleGenerate}
          disabled={isLoading || !canGenerate}
          className="btn-primary w-full py-3 mt-1"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              جاري المعالجة...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>{BOOK_TOOLS.find((t) => t.value === tool)?.icon}</span>
              {BOOK_TOOLS.find((t) => t.value === tool)?.label}
            </span>
          )}
        </button>

        {result && !isLoading && (
          <button onClick={reset} className="btn-ghost w-full text-xs text-slate-500">
            مسح النتيجة
          </button>
        )}
      </StudioFormPanel>

      {/* ===== النتيجة ===== */}
      <StudioResultPanel>
        <div className="flex gap-1 rounded-lg border border-slate-700 bg-slate-800/50 p-1">
          {(['generate', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 rounded-md py-1.5 text-xs font-medium transition-all',
                activeTab === tab ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'
              )}
            >
              {tab === 'generate' ? '📚 النتيجة' : '🕐 السجل'}
            </button>
          ))}
        </div>

        {activeTab === 'generate' ? (
          <GenerationResult
            result={result}
            isLoading={isLoading}
            error={error}
            loadingText="جاري المعالجة..."
            studioName="كتب-وأدوات"
            onRegenerate={result ? handleGenerate : undefined}
          />
        ) : (
          <GenerationHistory studioSlug="books-tools" />
        )}
      </StudioResultPanel>
    </StudioLayout>
  )
}
