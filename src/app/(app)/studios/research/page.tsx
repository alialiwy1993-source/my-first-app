'use client'

import { useState } from 'react'
import StudioLayout, { StudioFormPanel, StudioResultPanel } from '@/components/studios/StudioLayout'
import GenerationResult from '@/components/studios/GenerationResult'
import GenerationHistory from '@/components/studios/GenerationHistory'
import { useGeneration } from '@/hooks/useGeneration'
import { getStudio } from '@/lib/constants/studios'
import { cn } from '@/lib/utils'
import { RESEARCH_TOOL_LABELS, type ResearchTool, type ResearchLevel } from '@/lib/openai/prompts/research'

// =====================================================
// بيانات ثابتة
// =====================================================
const TOOLS_GROUPS: { label: string; tools: ResearchTool[] }[] = [
  {
    label: '📐 هيكل البحث',
    tools: ['research-plan', 'chapter-outline', 'research-questions', 'objectives'],
  },
  {
    label: '📝 أقسام البحث',
    tools: ['problem-statement', 'significance', 'methodology', 'theoretical-framework'],
  },
  {
    label: '📚 المراجع والمحتوى',
    tools: ['literature-review', 'references', 'abstract'],
  },
  {
    label: '✏️ التحرير الأكاديمي',
    tools: ['academic-summary', 'academic-rephrase'],
  },
]

const LEVELS: { value: ResearchLevel; label: string; icon: string }[] = [
  { value: 'bachelor', label: 'بكالوريوس', icon: '🎓' },
  { value: 'master',   label: 'ماجستير',   icon: '📖' },
  { value: 'phd',      label: 'دكتوراه',    icon: '🏆' },
  { value: 'other',    label: 'أكاديمي عام', icon: '📄' },
]

const TEXT_TOOLS: ResearchTool[] = ['academic-summary', 'academic-rephrase']

export default function ResearchStudioPage() {
  const studio = getStudio('research')!

  const [selectedTool, setSelectedTool] = useState<ResearchTool>('research-plan')
  const [level, setLevel] = useState<ResearchLevel>('master')
  const [field, setField] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [textToProcess, setTextToProcess] = useState('')
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate')

  const { result, isLoading, error, generate, reset } = useGeneration({ studioSlug: 'research' })

  const needsText = TEXT_TOOLS.includes(selectedTool)
  const canGenerate = field.trim() && title.trim() && (!needsText || textToProcess.trim())

  const handleGenerate = async () => {
    if (!canGenerate) return
    await generate({
      tool: selectedTool,
      level,
      field: field.trim(),
      title: title.trim(),
      description: description.trim(),
      textToProcess: needsText ? textToProcess.trim() : undefined,
      language: 'ar',
    })
  }

  return (
    <StudioLayout studio={studio} layout="split">
      {/* ===== نموذج الإدخال ===== */}
      <StudioFormPanel title="إعدادات البحث">

        {/* Academic Disclaimer */}
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300 leading-relaxed">
          <span className="font-semibold">⚠️ تنبيه:</span> هذا الاستوديو مساعد أكاديمي للتنظيم والإرشاد فقط.
          المخرجات هي أطر استرشادية — يجب مراجعتها وتطويرها وتوثيق مصادرك الحقيقية.
        </div>

        {/* Tool Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400">اختر الأداة</label>
          {TOOLS_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                {group.label}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {group.tools.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTool(t)}
                    className={cn(
                      'rounded-lg border px-2.5 py-2 text-xs text-right transition-all',
                      selectedTool === t
                        ? 'border-amber-500/50 bg-amber-500/15 text-white font-medium'
                        : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                    )}
                  >
                    {RESEARCH_TOOL_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Level */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">مستوى البحث</label>
          <div className="grid grid-cols-2 gap-2">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all',
                  level === l.value
                    ? 'border-amber-500/50 bg-amber-500/15 text-white'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                )}
              >
                <span>{l.icon}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">مجال البحث *</label>
          <input
            type="text"
            value={field}
            onChange={(e) => setField(e.target.value)}
            placeholder="مثال: علم الاجتماع، هندسة برمجيات، التسويق..."
            className="input-base"
          />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">عنوان البحث *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="أدخل عنوان بحثك أو موضوعه المقترح"
            className="input-base"
          />
        </div>

        {/* Description (optional) */}
        {!needsText && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">
              وصف إضافي <span className="text-slate-600">(اختياري)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أي تفاصيل إضافية عن بحثك تساعد على تحسين النتيجة..."
              rows={3}
              className="input-base resize-none"
            />
          </div>
        )}

        {/* Text to process (للتلخيص وإعادة الصياغة) */}
        {needsText && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">
              النص المراد {selectedTool === 'academic-summary' ? 'تلخيصه' : 'إعادة صياغته'} *
            </label>
            <textarea
              value={textToProcess}
              onChange={(e) => setTextToProcess(e.target.value)}
              placeholder="الصق النص الأكاديمي هنا..."
              rows={6}
              className="input-base resize-none"
            />
            <p className="text-[10px] text-slate-600">{textToProcess.length}/5000</p>
          </div>
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
              <span>🎓</span>
              {RESEARCH_TOOL_LABELS[selectedTool]}
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
              {tab === 'generate' ? '🎓 النتيجة' : '🕐 السجل'}
            </button>
          ))}
        </div>

        {activeTab === 'generate' ? (
          <GenerationResult
            result={result}
            isLoading={isLoading}
            error={error}
            loadingText="جاري المعالجة الأكاديمية..."
            studioName="بحث-أكاديمي"
            onRegenerate={result ? handleGenerate : undefined}
          />
        ) : (
          <GenerationHistory studioSlug="research" />
        )}
      </StudioResultPanel>
    </StudioLayout>
  )
}
