'use client'

import { useState } from 'react'
import Link from 'next/link'
import GenerationResult from '@/components/studios/GenerationResult'
import GenerationHistory from '@/components/studios/GenerationHistory'
import { useGeneration } from '@/hooks/useGeneration'
import { cn } from '@/lib/utils'
import type { VideoPlatform, VideoType, VideoDuration } from '@/lib/openai/prompts/video'

// =====================================================
// Config Data
// =====================================================
const PLATFORMS: { value: VideoPlatform; label: string; icon: string; color: string }[] = [
  { value: 'youtube',   label: 'يوتيوب',   icon: '▶️', color: 'border-red-500/50 bg-red-500/15' },
  { value: 'tiktok',    label: 'تيك توك',  icon: '🎵', color: 'border-pink-500/50 bg-pink-500/15' },
  { value: 'instagram', label: 'إنستغرام', icon: '📸', color: 'border-purple-500/50 bg-purple-500/15' },
  { value: 'reels',     label: 'Reels / Shorts', icon: '⚡', color: 'border-orange-500/50 bg-orange-500/15' },
]

const VIDEO_TYPES: { value: VideoType; label: string; icon: string }[] = [
  { value: 'educational',   label: 'تعليمي',         icon: '📚' },
  { value: 'entertainment', label: 'ترفيهي',         icon: '🎭' },
  { value: 'tutorial',      label: 'شرح خطوة بخطوة', icon: '📋' },
  { value: 'vlog',          label: 'فلوج يومي',       icon: '📹' },
  { value: 'product-review',label: 'مراجعة منتج',    icon: '⭐' },
  { value: 'motivational',  label: 'تحفيزي',         icon: '💪' },
  { value: 'news',          label: 'إخباري',          icon: '📰' },
  { value: 'documentary',   label: 'وثائقي',          icon: '🎬' },
]

const DURATIONS: { value: VideoDuration; label: string; desc: string; icon: string }[] = [
  { value: '30s',   label: '30 ثانية', desc: 'شورت / ريلز',  icon: '⚡' },
  { value: '60s',   label: '60 ثانية', desc: 'تيك توك',       icon: '🎵' },
  { value: '3min',  label: '3 دقائق',  desc: 'فيديو قصير',   icon: '📱' },
  { value: '5min',  label: '5 دقائق',  desc: 'متوسط',         icon: '🎯' },
  { value: '10min', label: '10 دقائق', desc: 'يوتيوب',        icon: '▶️' },
  { value: '15min', label: '15 دقيقة', desc: 'مطوّل',         icon: '🎬' },
]

const STYLES = [
  'احترافي وبسيط',
  'سينمائي درامي',
  'رسوم متحركة',
  'وجه للكاميرا (Talking Head)',
  'B-roll + صوت',
  'نصوص وجرافيك',
  'وثائقي',
]

const TONES = ['محفز', 'هادئ', 'مرح', 'جدي', 'إخباري', 'عاطفي', 'تعليمي']

export default function VideoStudioPage() {
  const [idea, setIdea]               = useState('')
  const [platform, setPlatform]       = useState<VideoPlatform>('youtube')
  const [videoType, setVideoType]     = useState<VideoType>('educational')
  const [duration, setDuration]       = useState<VideoDuration>('5min')
  const [style, setStyle]             = useState('')
  const [tone, setTone]               = useState('محفز')
  const [audience, setAudience]       = useState('')
  const [activeTab, setActiveTab]     = useState<'generate' | 'history'>('generate')

  const { result, isLoading, error, generate, reset } = useGeneration({ studioSlug: 'video' })

  const canGenerate = idea.trim().length >= 10

  const handleGenerate = async () => {
    if (!canGenerate) return
    await generate({
      idea: idea.trim(),
      platform,
      videoType,
      duration,
      style: style || undefined,
      targetAudience: audience.trim() || undefined,
      tone,
      language: 'ar',
    })
  }

  const activePlatform = PLATFORMS.find(p => p.value === platform)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/studios"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white transition-colors text-sm"
        >
          →
        </Link>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl shadow-lg"
          style={{ background: '#f9731620', boxShadow: '0 0 20px #f9731615' }}
        >
          🎞️
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">استوديو توليد الفيديو</h1>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
              Beta
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            توليد سكربت + مشاهد + محتوى كامل — ربط API الفيديو قادم
          </p>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚧</span>
          <div>
            <p className="text-sm font-semibold text-amber-300">توليد الفيديو الفعلي قادم</p>
            <p className="text-xs text-amber-400/80 mt-0.5">
              حالياً يولّد الاستوديو: سكربت كامل + تقسيم المشاهد + Prompts + وصف + هاشتاقات.
              ربط Runway / Pika / Sora سيُضاف في التحديث القادم.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-slate-700 bg-slate-800/50 p-1 w-fit">
        {(['generate', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'rounded-md px-4 py-1.5 text-xs font-medium transition-all',
              activeTab === tab ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'
            )}
          >
            {tab === 'generate' ? '🎬 التوليد' : '🕐 السجل'}
          </button>
        ))}
      </div>

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Form */}
          <div className="space-y-4 rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
            <h2 className="text-sm font-semibold text-slate-300">تفاصيل الفيديو</h2>

            {/* Idea */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">فكرة الفيديو *</label>
              <textarea
                value={idea}
                onChange={e => setIdea(e.target.value)}
                placeholder="اكتب فكرة الفيديو بوضوح... مثال: شرح مفهوم الذكاء الاصطناعي للمبتدئين بأمثلة عملية"
                rows={3}
                className="input-base resize-none"
                maxLength={1000}
              />
              <p className="text-[10px] text-slate-600">{idea.length}/1000</p>
            </div>

            {/* Platform */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">المنصة</label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setPlatform(p.value)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all',
                      platform === p.value ? p.color + ' text-white' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    <span className="text-base">{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">نوع الفيديو</label>
              <div className="grid grid-cols-2 gap-1.5">
                {VIDEO_TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setVideoType(t.value)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs transition-all text-right',
                      videoType === t.value
                        ? 'border-orange-500/50 bg-orange-500/15 text-white font-medium'
                        : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    <span>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">مدة الفيديو</label>
              <div className="grid grid-cols-3 gap-1.5">
                {DURATIONS.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    className={cn(
                      'flex flex-col items-center gap-0.5 rounded-lg border py-2 text-xs transition-all',
                      duration === d.value
                        ? 'border-orange-500/50 bg-orange-500/15 text-white'
                        : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    <span>{d.icon}</span>
                    <span className="font-medium">{d.label}</span>
                    <span className="text-[10px] text-slate-500">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">أسلوب التصوير</label>
              <div className="flex flex-wrap gap-1.5">
                {STYLES.map(s => (
                  <button
                    key={s}
                    onClick={() => setStyle(style === s ? '' : s)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-xs transition-all',
                      style === s
                        ? 'border-orange-500/50 bg-orange-500/20 text-orange-300'
                        : 'border-slate-700 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">نبرة المحتوى</label>
              <div className="flex flex-wrap gap-1.5">
                {TONES.map(t => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-xs transition-all',
                      tone === t
                        ? 'border-orange-500/50 bg-orange-500/20 text-orange-300'
                        : 'border-slate-700 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Audience */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">
                الجمهور المستهدف <span className="text-slate-600">(اختياري)</span>
              </label>
              <input
                type="text"
                value={audience}
                onChange={e => setAudience(e.target.value)}
                placeholder="مثال: شباب مهتمون بالتقنية، طلاب جامعيون..."
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
                  جاري إنشاء محتوى الفيديو...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>{activePlatform?.icon}</span>
                  توليد السكربت والمشاهد
                </span>
              )}
            </button>
            {!canGenerate && idea.trim().length > 0 && (
              <p className="text-[10px] text-amber-400 text-center">
                أدخل 10 أحرف على الأقل للفكرة
              </p>
            )}

            {result && !isLoading && (
              <button onClick={reset} className="btn-ghost w-full text-xs text-slate-500">
                مسح النتيجة
              </button>
            )}
          </div>

          {/* Result */}
          <GenerationResult
            result={result}
            isLoading={isLoading}
            error={error}
            loadingText="جاري إنشاء محتوى الفيديو الكامل..."
            studioName="سكربت-فيديو"
            onRegenerate={result ? handleGenerate : undefined}
          />
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <GenerationHistory studioSlug="video" />
      )}
    </div>
  )
}
