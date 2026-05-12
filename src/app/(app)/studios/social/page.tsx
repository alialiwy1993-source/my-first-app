'use client'

import { useState } from 'react'
import StudioLayout, { StudioFormPanel, StudioResultPanel } from '@/components/studios/StudioLayout'
import GenerationResult from '@/components/studios/GenerationResult'
import GenerationHistory from '@/components/studios/GenerationHistory'
import { useGeneration } from '@/hooks/useGeneration'
import { getStudio } from '@/lib/constants/studios'
import { cn } from '@/lib/utils'
import { SOCIAL_TOOL_LABELS, type SocialTool, type SocialPlatform } from '@/lib/openai/prompts/social'

const TOOLS: { value: SocialTool; icon: string }[] = [
  { value: 'content-ideas',     icon: '💡' },
  { value: 'video-script',      icon: '📜' },
  { value: 'video-description', icon: '📝' },
  { value: 'catchy-titles',     icon: '🎯' },
  { value: 'hashtags',          icon: '#️⃣' },
  { value: 'content-plan',      icon: '📅' },
  { value: 'hook',              icon: '🪝' },
  { value: 'cta',               icon: '📣' },
  { value: 'article-to-script', icon: '🔄' },
  { value: 'short-content',     icon: '⚡' },
]

const PLATFORMS: { value: SocialPlatform; label: string; icon: string; color: string }[] = [
  { value: 'youtube',   label: 'يوتيوب',    icon: '▶️', color: 'border-red-500/50 bg-red-500/15' },
  { value: 'tiktok',    label: 'تيك توك',   icon: '🎵', color: 'border-pink-500/50 bg-pink-500/15' },
  { value: 'instagram', label: 'إنستغرام',  icon: '📸', color: 'border-purple-500/50 bg-purple-500/15' },
  { value: 'all',       label: 'الكل',      icon: '🌐', color: 'border-brand-500/50 bg-brand-500/15' },
]

const TONES = [
  { value: 'energetic',    label: 'حماسي' },
  { value: 'professional', label: 'احترافي' },
  { value: 'casual',       label: 'عفوي' },
  { value: 'educational',  label: 'تعليمي' },
  { value: 'entertaining', label: 'ترفيهي' },
]

const DURATIONS = [
  { value: '30-60 ثانية', label: '30-60 ث', icon: '⚡' },
  { value: '1-3 دقائق',   label: '1-3 د',   icon: '⏱' },
  { value: '5-10 دقائق',  label: '5-10 د',  icon: '🎬' },
  { value: '15-20 دقيقة', label: '15-20 د', icon: '📹' },
]

// أدوات تحتاج نص مقال
const ARTICLE_TOOLS: SocialTool[] = ['article-to-script']

export default function SocialStudioPage() {
  const studio = getStudio('social')!

  const [tool, setTool]       = useState<SocialTool>('content-ideas')
  const [platform, setPlatform] = useState<SocialPlatform>('youtube')
  const [niche, setNiche]     = useState('')
  const [topic, setTopic]     = useState('')
  const [tone, setTone]       = useState('casual')
  const [duration, setDuration] = useState('')
  const [audience, setAudience] = useState('')
  const [articleText, setArticleText] = useState('')
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate')

  const { result, isLoading, error, generate, reset } = useGeneration({ studioSlug: 'social' })

  const needsArticle = ARTICLE_TOOLS.includes(tool)
  const canGenerate = niche.trim() && topic.trim() && (!needsArticle || articleText.trim())

  const handleGenerate = async () => {
    if (!canGenerate) return
    await generate({
      tool,
      platform,
      niche: niche.trim(),
      topic: topic.trim(),
      targetAudience: audience.trim() || undefined,
      tone,
      duration: duration || undefined,
      articleText: needsArticle ? articleText.trim() : undefined,
      language: 'ar',
    })
  }

  const activePlatform = PLATFORMS.find((p) => p.value === platform)

  return (
    <StudioLayout studio={studio} layout="split">
      <StudioFormPanel title="إعدادات المحتوى">

        {/* Platform */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">المنصة</label>
          <div className="grid grid-cols-2 gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all',
                  platform === p.value
                    ? p.color + ' text-white'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                )}
              >
                <span className="text-base">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tool */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">نوع المحتوى</label>
          <div className="grid grid-cols-2 gap-1.5">
            {TOOLS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTool(t.value)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs transition-all text-right',
                  tool === t.value
                    ? 'border-red-500/50 bg-red-500/15 text-white font-medium'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                )}
              >
                <span>{t.icon}</span>
                <span className="truncate">{SOCIAL_TOOL_LABELS[t.value]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Niche */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">مجال القناة / النيش *</label>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="مثال: تقنية، طبخ، تطوير الذات، رياضة..."
            className="input-base"
          />
        </div>

        {/* Topic */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">موضوع المحتوى *</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="مثال: أفضل 5 تطبيقات للإنتاجية في 2025"
            className="input-base"
          />
        </div>

        {/* Article text (for article-to-script) */}
        {needsArticle && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">نص المقال *</label>
            <textarea
              value={articleText}
              onChange={(e) => setArticleText(e.target.value)}
              placeholder="الصق نص المقال هنا لتحويله إلى سكربت فيديو..."
              rows={5}
              className="input-base resize-none"
            />
          </div>
        )}

        {/* Tone */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">أسلوب المحتوى</label>
          <div className="flex flex-wrap gap-1.5">
            {TONES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs transition-all',
                  tone === t.value
                    ? 'border-red-500/50 bg-red-500/20 text-red-300'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duration (for scripts) */}
        {(tool === 'video-script' || tool === 'short-content') && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">مدة الفيديو</label>
            <div className="grid grid-cols-4 gap-1.5">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  className={cn(
                    'rounded-lg border p-2 text-center text-xs transition-all',
                    duration === d.value
                      ? 'border-red-500/50 bg-red-500/15 text-white'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                  )}
                >
                  <div className="text-base mb-0.5">{d.icon}</div>
                  <div>{d.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Target audience */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">
            الجمهور المستهدف <span className="text-slate-600">(اختياري)</span>
          </label>
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="مثال: شباب 18-30، رواد أعمال، طلاب..."
            className="input-base"
          />
        </div>

        {/* Generate */}
        <button
          onClick={handleGenerate}
          disabled={isLoading || !canGenerate}
          className="btn-primary w-full py-3 mt-1"
          style={{ background: canGenerate && !isLoading ? undefined : undefined }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              جاري الإنشاء...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>{activePlatform?.icon}</span>
              {SOCIAL_TOOL_LABELS[tool]}
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
              {tab === 'generate' ? '🎥 النتيجة' : '🕐 السجل'}
            </button>
          ))}
        </div>

        {activeTab === 'generate' ? (
          <GenerationResult
            result={result}
            isLoading={isLoading}
            error={error}
            loadingText="جاري إنشاء المحتوى..."
            studioName="سوشيال"
            onRegenerate={result ? handleGenerate : undefined}
          />
        ) : (
          <GenerationHistory studioSlug="social" />
        )}
      </StudioResultPanel>
    </StudioLayout>
  )
}
