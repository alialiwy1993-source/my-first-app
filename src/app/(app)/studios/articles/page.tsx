'use client'

import { useState } from 'react'
import StudioLayout, { StudioFormPanel, StudioResultPanel } from '@/components/studios/StudioLayout'
import GenerationResult from '@/components/studios/GenerationResult'
import GenerationHistory from '@/components/studios/GenerationHistory'
import { useGeneration } from '@/hooks/useGeneration'
import { getStudio } from '@/lib/constants/studios'
import { cn } from '@/lib/utils'

const ARTICLE_TYPES = [
  { value: 'general',     label: 'عام',       icon: '📄' },
  { value: 'seo',         label: 'SEO',        icon: '🔍' },
  { value: 'technical',   label: 'تقني',       icon: '⚙️' },
  { value: 'marketing',   label: 'تسويقي',     icon: '📣' },
  { value: 'educational', label: 'تعليمي',     icon: '🎓' },
  { value: 'opinion',     label: 'رأي',        icon: '💭' },
]

const TONES = [
  { value: 'professional', label: 'احترافي' },
  { value: 'casual',       label: 'غير رسمي' },
  { value: 'academic',     label: 'أكاديمي' },
  { value: 'persuasive',   label: 'إقناعي' },
  { value: 'informative',  label: 'إخباري' },
]

const LENGTHS = [
  { value: 'short',  label: 'قصير',    desc: '300-500 كلمة' },
  { value: 'medium', label: 'متوسط',   desc: '600-900 كلمة' },
  { value: 'long',   label: 'طويل',    desc: '1000-1500 كلمة' },
]

export default function ArticlesStudioPage() {
  const studio = getStudio('articles')!

  const [form, setForm] = useState({
    type: 'general',
    topic: '',
    tone: 'professional',
    length: 'medium',
    keywords: '',
    targetAudience: '',
  })

  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate')

  const { result, isLoading, error, generate, reset } = useGeneration({
    studioSlug: 'articles',
  })

  const handleGenerate = async () => {
    if (!form.topic.trim()) return
    await generate(form)
  }

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <StudioLayout studio={studio} layout="split">
      {/* ===== Form Panel ===== */}
      <StudioFormPanel title="إعدادات المقال">
        {/* Topic */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">موضوع المقال *</label>
          <textarea
            value={form.topic}
            onChange={e => set('topic', e.target.value)}
            placeholder="مثال: فوائد الذكاء الاصطناعي في التعليم"
            rows={3}
            className="input-base resize-none"
          />
          <p className="text-[10px] text-slate-600">{form.topic.length}/500</p>
        </div>

        {/* Article Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">نوع المقال</label>
          <div className="grid grid-cols-3 gap-2">
            {ARTICLE_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => set('type', t.value)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs transition-all',
                  form.type === t.value
                    ? 'border-brand-500/50 bg-brand-600/15 text-white'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                )}
              >
                <span className="text-base">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">أسلوب الكتابة</label>
          <div className="flex flex-wrap gap-2">
            {TONES.map(t => (
              <button
                key={t.value}
                onClick={() => set('tone', t.value)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs transition-all',
                  form.tone === t.value
                    ? 'border-brand-500/50 bg-brand-600/20 text-brand-300'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Length */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">الطول</label>
          <div className="grid grid-cols-3 gap-2">
            {LENGTHS.map(l => (
              <button
                key={l.value}
                onClick={() => set('length', l.value)}
                className={cn(
                  'rounded-lg border p-2.5 text-center transition-all',
                  form.length === l.value
                    ? 'border-brand-500/50 bg-brand-600/15 text-white'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                )}
              >
                <p className="text-xs font-medium">{l.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{l.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Keywords */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">
            الكلمات المفتاحية <span className="text-slate-600">(اختياري)</span>
          </label>
          <input
            type="text"
            value={form.keywords}
            onChange={e => set('keywords', e.target.value)}
            placeholder="ذكاء اصطناعي، تعليم، مستقبل"
            className="input-base"
          />
        </div>

        {/* Target Audience */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">
            الجمهور المستهدف <span className="text-slate-600">(اختياري)</span>
          </label>
          <input
            type="text"
            value={form.targetAudience}
            onChange={e => set('targetAudience', e.target.value)}
            placeholder="طلاب جامعيون، مدراء شركات..."
            className="input-base"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading || !form.topic.trim()}
          className="btn-primary w-full py-3 mt-2"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              جاري كتابة المقال...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>✍️</span> كتابة المقال
            </span>
          )}
        </button>

        {result && !isLoading && (
          <button onClick={reset} className="btn-ghost w-full text-xs text-slate-500">
            مسح النتيجة
          </button>
        )}
      </StudioFormPanel>

      {/* ===== Result Panel ===== */}
      <StudioResultPanel>
        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border border-slate-700 bg-slate-800/50 p-1">
          {(['generate', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 rounded-md py-1.5 text-xs font-medium transition-all',
                activeTab === tab
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-300'
              )}
            >
              {tab === 'generate' ? '✨ التوليد' : '🕐 السجل'}
            </button>
          ))}
        </div>

        {activeTab === 'generate' ? (
          <GenerationResult
            result={result}
            isLoading={isLoading}
            error={error}
            loadingText="جاري كتابة المقال..."
            studioName="مقال"
            onRegenerate={result ? handleGenerate : undefined}
          />
        ) : (
          <GenerationHistory studioSlug="articles" />
        )}
      </StudioResultPanel>
    </StudioLayout>
  )
}
