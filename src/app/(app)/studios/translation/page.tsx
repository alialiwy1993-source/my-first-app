'use client'

import { useState } from 'react'
import StudioLayout, { StudioFormPanel, StudioResultPanel } from '@/components/studios/StudioLayout'
import GenerationResult from '@/components/studios/GenerationResult'
import GenerationHistory from '@/components/studios/GenerationHistory'
import { useGeneration } from '@/hooks/useGeneration'
import { getStudio } from '@/lib/constants/studios'
import { cn } from '@/lib/utils'

const LANGUAGES = [
  { value: 'ar', label: 'العربية', flag: '🇸🇦' },
  { value: 'en', label: 'الإنجليزية', flag: '🇺🇸' },
  { value: 'fr', label: 'الفرنسية', flag: '🇫🇷' },
  { value: 'de', label: 'الألمانية', flag: '🇩🇪' },
  { value: 'es', label: 'الإسبانية', flag: '🇪🇸' },
  { value: 'zh', label: 'الصينية', flag: '🇨🇳' },
  { value: 'tr', label: 'التركية', flag: '🇹🇷' },
  { value: 'ru', label: 'الروسية', flag: '🇷🇺' },
]

const TRANSLATION_TYPES = [
  { value: 'general',   label: 'عامة',      icon: '🌐', desc: 'ترجمة دقيقة وطبيعية' },
  { value: 'academic',  label: 'أكاديمية',   icon: '🎓', desc: 'مصطلحات علمية رسمية' },
  { value: 'marketing', label: 'تسويقية',    icon: '📣', desc: 'أسلوب مقنع وجذاب' },
  { value: 'technical', label: 'تقنية',      icon: '⚙️', desc: 'مصطلحات تقنية دقيقة' },
  { value: 'literary',  label: 'أدبية',      icon: '📖', desc: 'محافظة على الأسلوب' },
  { value: 'official',  label: 'رسمية',      icon: '📋', desc: 'وثائق ومراسلات رسمية' },
]

const MODES = [
  { value: 'translate',      label: 'ترجمة', icon: '🌐' },
  { value: 'improve',        label: 'تحسين الترجمة', icon: '✨' },
  { value: 'rephrase',       label: 'إعادة صياغة', icon: '🔄' },
  { value: 'detect-errors',  label: 'كشف الأخطاء', icon: '🔍' },
]

export default function TranslationStudioPage() {
  const studio = getStudio('translation')!

  const [form, setForm] = useState({
    text: '',
    sourceLanguage: 'ar',
    targetLanguage: 'en',
    type: 'general',
    mode: 'translate',
  })

  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate')
  const { result, isLoading, error, generate, reset } = useGeneration({ studioSlug: 'translation' })

  const handleGenerate = async () => {
    if (!form.text.trim()) return
    await generate(form)
  }

  const swapLanguages = () => {
    setForm(prev => ({ ...prev, sourceLanguage: prev.targetLanguage, targetLanguage: prev.sourceLanguage }))
  }

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))
  const charCount = form.text.length
  const isOverLimit = charCount > 5000

  return (
    <StudioLayout studio={studio} layout="split">
      {/* ===== Form Panel ===== */}
      <StudioFormPanel title="إعدادات الترجمة">

        {/* Mode selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">الوضع</label>
          <div className="grid grid-cols-2 gap-2">
            {MODES.map(m => (
              <button
                key={m.value}
                onClick={() => set('mode', m.value)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border p-2.5 text-xs transition-all text-right',
                  form.mode === m.value
                    ? 'border-brand-500/50 bg-brand-600/15 text-white'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                )}
              >
                <span className="text-base">{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Language selector — فقط في وضع الترجمة */}
        {form.mode === 'translate' && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">اللغات</label>
            <div className="flex items-center gap-2">
              <select
                value={form.sourceLanguage}
                onChange={e => set('sourceLanguage', e.target.value)}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-300 outline-none focus:border-brand-500 transition-colors"
              >
                {LANGUAGES.map(l => (
                  <option key={l.value} value={l.value}>{l.flag} {l.label}</option>
                ))}
              </select>

              <button
                onClick={swapLanguages}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-white transition-all"
                title="تبديل اللغتين"
              >
                ⇄
              </button>

              <select
                value={form.targetLanguage}
                onChange={e => set('targetLanguage', e.target.value)}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-300 outline-none focus:border-brand-500 transition-colors"
              >
                {LANGUAGES.map(l => (
                  <option key={l.value} value={l.value}>{l.flag} {l.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Translation Type — فقط في وضع الترجمة */}
        {form.mode === 'translate' && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">نوع الترجمة</label>
            <div className="grid grid-cols-2 gap-2">
              {TRANSLATION_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => set('type', t.value)}
                  className={cn(
                    'flex items-start gap-2 rounded-lg border p-2.5 text-right transition-all',
                    form.type === t.value
                      ? 'border-brand-500/50 bg-brand-600/15'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  )}
                >
                  <span className="text-base mt-0.5">{t.icon}</span>
                  <div>
                    <p className={cn('text-xs font-medium', form.type === t.value ? 'text-white' : 'text-slate-300')}>
                      {t.label}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-400">النص *</label>
            <span className={cn('text-[10px]', isOverLimit ? 'text-red-400' : 'text-slate-500')}>
              {charCount}/5000
            </span>
          </div>
          <textarea
            value={form.text}
            onChange={e => set('text', e.target.value)}
            placeholder={
              form.mode === 'translate' ? 'أدخل النص المراد ترجمته...' :
              form.mode === 'improve' ? 'أدخل الترجمة المراد تحسينها...' :
              form.mode === 'rephrase' ? 'أدخل النص المراد إعادة صياغته...' :
              'أدخل النص لفحص أخطائه اللغوية...'
            }
            rows={6}
            className={cn('input-base resize-none', isOverLimit && 'border-red-500/50')}
          />
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading || !form.text.trim() || isOverLimit}
          className="btn-primary w-full py-3"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              جاري المعالجة...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {MODES.find(m => m.value === form.mode)?.icon}
              {MODES.find(m => m.value === form.mode)?.label}
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
              {tab === 'generate' ? '🌐 النتيجة' : '🕐 السجل'}
            </button>
          ))}
        </div>

        {activeTab === 'generate' ? (
          <GenerationResult
            result={result}
            isLoading={isLoading}
            error={error}
            loadingText="جاري المعالجة..."
            studioName="ترجمة"
            onRegenerate={result ? handleGenerate : undefined}
            plainText={form.mode === 'translate'}
          />
        ) : (
          <GenerationHistory studioSlug="translation" />
        )}
      </StudioResultPanel>
    </StudioLayout>
  )
}
