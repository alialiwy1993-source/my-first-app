'use client'

import { useState } from 'react'
import Link from 'next/link'
import StudioLayout, { StudioFormPanel, StudioResultPanel } from '@/components/studios/StudioLayout'
import GenerationResult from '@/components/studios/GenerationResult'
import GenerationHistory from '@/components/studios/GenerationHistory'
import { useGeneration } from '@/hooks/useGeneration'
import { getStudio } from '@/lib/constants/studios'
import { cn } from '@/lib/utils'
import { type ThumbnailTool, type ThumbnailPlatform, type ThumbnailStyle } from '@/lib/openai/prompts/thumbnails'

const TOOLS: { value: ThumbnailTool; label: string; icon: string; desc: string }[] = [
  { value: 'ideas',             label: 'أفكار بصرية',     icon: '💡', desc: '5 أفكار إبداعية شاملة' },
  { value: 'text-overlay',      label: 'نصوص الصورة',     icon: '✍️', desc: 'Power words وعناوين قصيرة' },
  { value: 'color-composition', label: 'الألوان والتكوين', icon: '🎨', desc: 'لوحة ألوان + تكوين بصري' },
  { value: 'image-prompt',      label: 'Prompt للـ AI',    icon: '🤖', desc: 'prompt لـ DALL-E أو Midjourney' },
  { value: 'full-concept',      label: 'مفهوم متكامل',    icon: '🖼️', desc: 'كل شيء في مكان واحد' },
]

const PLATFORMS: { value: ThumbnailPlatform; label: string; icon: string; size: string }[] = [
  { value: 'youtube',   label: 'يوتيوب',   icon: '▶️', size: '1280×720' },
  { value: 'tiktok',    label: 'تيك توك',  icon: '🎵', size: '1080×1920' },
  { value: 'instagram', label: 'إنستغرام', icon: '📸', size: '1080×1080' },
]

const STYLES: { value: ThumbnailStyle; label: string; icon: string }[] = [
  { value: 'bold',        label: 'جريء وصادم',   icon: '💥' },
  { value: 'minimal',     label: 'بسيط وأنيق',   icon: '✨' },
  { value: 'dramatic',    label: 'درامي ومثير',  icon: '🎭' },
  { value: 'educational', label: 'تعليمي',        icon: '📚' },
  { value: 'lifestyle',   label: 'ووجوه حياة',   icon: '😊' },
  { value: 'faceless',    label: 'بدون وجه',      icon: '🎭' },
]

const EMOTIONS = [
  'فضول', 'إثارة', 'دهشة', 'طمع', 'خوف من الفوات', 'إلهام', 'ضحك', 'تحدي',
]

export default function ThumbnailsStudioPage() {
  const studio = getStudio('thumbnails')!

  const [tool, setTool]               = useState<ThumbnailTool>('ideas')
  const [platform, setPlatform]       = useState<ThumbnailPlatform>('youtube')
  const [videoTitle, setVideoTitle]   = useState('')
  const [niche, setNiche]             = useState('')
  const [style, setStyle]             = useState<ThumbnailStyle>('bold')
  const [emotion, setEmotion]         = useState('')
  const [colorPref, setColorPref]     = useState('')
  const [activeTab, setActiveTab]     = useState<'generate' | 'history'>('generate')

  const { result, isLoading, error, generate, reset } = useGeneration({ studioSlug: 'thumbnails' })

  const canGenerate = videoTitle.trim() && niche.trim()

  const handleGenerate = async () => {
    if (!canGenerate) return
    await generate({
      tool,
      platform,
      videoTitle: videoTitle.trim(),
      niche: niche.trim(),
      style,
      targetEmotion: emotion || undefined,
      colorPreference: colorPref.trim() || undefined,
      language: 'ar',
    })
  }

  return (
    <StudioLayout studio={studio} layout="split">
      <StudioFormPanel title="إعدادات الصورة المصغرة">

        {/* Platform */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">المنصة</label>
          <div className="grid grid-cols-3 gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg border py-2 text-xs transition-all',
                  platform === p.value
                    ? 'border-cyan-500/50 bg-cyan-500/15 text-white'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                )}
              >
                <span className="text-lg">{p.icon}</span>
                <span className="font-medium">{p.label}</span>
                <span className="text-[10px] text-slate-500">{p.size}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tool */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">الأداة</label>
          <div className="space-y-1.5">
            {TOOLS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTool(t.value)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-right transition-all',
                  tool === t.value
                    ? 'border-cyan-500/50 bg-cyan-500/15'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                )}
              >
                <span className="text-lg flex-shrink-0">{t.icon}</span>
                <div className="min-w-0">
                  <p className={cn('text-xs font-medium', tool === t.value ? 'text-white' : 'text-slate-300')}>
                    {t.label}
                  </p>
                  <p className="text-[10px] text-slate-500">{t.desc}</p>
                </div>
                {tool === t.value && (
                  <span className="mr-auto text-cyan-400 text-sm">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Video title */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">عنوان الفيديو *</label>
          <input
            type="text"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="مثال: أفضل 5 تطبيقات إنتاجية في 2025"
            className="input-base"
          />
        </div>

        {/* Niche */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">المجال / النيش *</label>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="مثال: تقنية، ربح من الإنترنت، طبخ..."
            className="input-base"
          />
        </div>

        {/* Style */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">أسلوب التصميم</label>
          <div className="grid grid-cols-3 gap-1.5">
            {STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg border py-2 text-xs transition-all',
                  style === s.value
                    ? 'border-cyan-500/50 bg-cyan-500/15 text-white'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                )}
              >
                <span>{s.icon}</span>
                <span className="text-[11px]">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Emotion */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">المشاعر المستهدفة</label>
          <div className="flex flex-wrap gap-1.5">
            {EMOTIONS.map((e) => (
              <button
                key={e}
                onClick={() => setEmotion(emotion === e ? '' : e)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs transition-all',
                  emotion === e
                    ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Color preference */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">
            تفضيل الألوان <span className="text-slate-600">(اختياري)</span>
          </label>
          <input
            type="text"
            value={colorPref}
            onChange={(e) => setColorPref(e.target.value)}
            placeholder="مثال: أزرق وأبيض، ألوان داكنة، ألوان صاخبة..."
            className="input-base"
          />
        </div>

        {/* Generate */}
        <button
          onClick={handleGenerate}
          disabled={isLoading || !canGenerate}
          className="btn-primary w-full py-3 mt-1"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              جاري الإنشاء...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>🖼️</span>
              {TOOLS.find((t) => t.value === tool)?.label}
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
              {tab === 'generate' ? '🖼️ النتيجة' : '🕐 السجل'}
            </button>
          ))}
        </div>

        {activeTab === 'generate' ? (
          <>
            <GenerationResult
              result={result}
              isLoading={isLoading}
              error={error}
              loadingText="جاري إنشاء الصورة المصغرة..."
              studioName="صورة-مصغرة"
              onRegenerate={result ? handleGenerate : undefined}
            />

            {/* ربط باستوديو الصور — يظهر عند وجود نتيجة من أداة image-prompt */}
            {result && !isLoading && tool === 'image-prompt' && (
              <Link
                href={`/studios/images?prompt=${encodeURIComponent(videoTitle)}`}
                className="flex items-center justify-center gap-2 rounded-xl border border-pink-500/30 bg-pink-500/10 py-3 text-sm font-medium text-pink-300 hover:bg-pink-500/20 transition-colors"
              >
                <span>🎨</span>
                فتح في استوديو توليد الصور
              </Link>
            )}
          </>
        ) : (
          <GenerationHistory studioSlug="thumbnails" />
        )}
      </StudioResultPanel>
    </StudioLayout>
  )
}
