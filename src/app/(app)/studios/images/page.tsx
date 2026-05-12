'use client'

import { useState, useCallback, type FormEvent } from 'react'
import Link from 'next/link'
import { getStudio } from '@/lib/constants/studios'
import { cn, copyToClipboard } from '@/lib/utils'

// =====================================================
// Configuration
// =====================================================
const IMAGE_STYLES = [
  { value: 'realistic',       label: 'واقعي',              icon: '📷', desc: 'صورة فوتوغرافية عالية الجودة' },
  { value: 'cinematic',       label: 'سينمائي',            icon: '🎬', desc: 'أسلوب تصوير سينمائي درامي' },
  { value: 'cartoon',         label: 'كرتوني',             icon: '🎨', desc: 'رسم كرتوني وتوضيحي' },
  { value: 'anime',           label: 'أنمي',               icon: '⛩️', desc: 'أسلوب أنمي ياباني' },
  { value: '3d',              label: 'ثلاثي الأبعاد',      icon: '🎯', desc: 'تصيير CGI ثلاثي الأبعاد' },
  { value: 'advertising',     label: 'إعلاني',             icon: '📢', desc: 'صورة تجارية احترافية' },
  { value: 'youtube_thumbnail', label: 'يوتيوب ثمبنيل',   icon: '▶️', desc: 'صورة مصغرة مثالية لليوتيوب' },
  { value: 'social_media',    label: 'سوشيال ميديا',       icon: '📱', desc: 'تصميم جذاب لمنصات التواصل' },
]

const IMAGE_SIZES = [
  { value: '1024x1024', label: 'مربع',     ratio: '1:1',  icon: '⬛', desc: 'مناسب للسوشيال ميديا' },
  { value: '1792x1024', label: 'أفقي',     ratio: '16:9', icon: '📺', desc: 'مناسب لليوتيوب والشاشات' },
  { value: '1024x1792', label: 'عمودي',    ratio: '9:16', icon: '📱', desc: 'مناسب للستوري والريلز' },
]

const QUALITY_OPTIONS = [
  { value: 'standard', label: 'قياسي',     icon: '⚡', desc: 'أسرع وأقل تكلفة' },
  { value: 'hd',       label: 'عالي الدقة', icon: '💎', desc: 'أعلى جودة وتفاصيل أدق' },
]

const PROMPT_EXAMPLES = [
  'منظر طبيعي خلاب لجبال مغطاة بالثلج عند الغروب',
  'قطة لطيفة تجلس على نافذة في يوم ممطر',
  'شخص يعمل في مكتب عصري مضيء',
  'مدينة مستقبلية ليلاً مع أضواء النيون',
  'طبق طعام عربي فاخر منظم بشكل جميل',
]

interface GeneratedImage {
  imageUrl: string
  revisedPrompt: string
  style: string
  size: string
  durationMs: number
  id: string | null
}

export default function ImageStudioPage() {
  const studio = getStudio('images')!

  const [prompt, setPrompt]     = useState('')
  const [style, setStyle]       = useState('realistic')
  const [size, setSize]         = useState('1024x1024')
  const [quality, setQuality]   = useState('standard')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [result, setResult]     = useState<GeneratedImage | null>(null)
  const [copied, setCopied]     = useState(false)

  const handleGenerate = useCallback(async (e?: FormEvent) => {
    e?.preventDefault()
    if (!prompt.trim() || isLoading) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), style, size, quality }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'خطأ في توليد الصورة')
      }

      setResult(data as GeneratedImage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }, [prompt, style, size, quality, isLoading])

  const handleCopyPrompt = async () => {
    if (!result) return
    await copyToClipboard(result.revisedPrompt || prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async () => {
    if (!result?.imageUrl) return
    try {
      const response = await fetch(result.imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-image-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // Fallback: open in new tab
      window.open(result.imageUrl, '_blank')
    }
  }

  const selectedStyle = IMAGE_STYLES.find(s => s.value === style)
  const selectedSize  = IMAGE_SIZES.find(s => s.value === size)

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
          style={{ background: '#ec489920', boxShadow: '0 0 20px #ec489915' }}
        >
          🎨
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">استوديو توليد الصور</h1>
          <p className="text-xs text-slate-400 mt-0.5">أنشئ صوراً إبداعية بالذكاء الاصطناعي</p>
        </div>
        <Link
          href="/studios/images/gallery"
          className="mr-auto flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-600 hover:text-white transition-colors"
        >
          <span>🖼️</span> معرض الصور
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ===== Form ===== */}
        <div className="space-y-4 rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
          <h2 className="text-sm font-semibold text-slate-300">إعدادات الصورة</h2>

          {/* Prompt */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">وصف الصورة *</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="صف الصورة التي تريدها بوضوح وتفاصيل..."
              rows={4}
              className="input-base resize-none"
              maxLength={1000}
            />
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-slate-600">{prompt.length}/1000</p>
              <div className="flex flex-wrap gap-1">
                {PROMPT_EXAMPLES.slice(0, 3).map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(ex)}
                    className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] text-slate-500 hover:border-slate-600 hover:text-slate-300 transition-colors"
                  >
                    {ex.slice(0, 20)}...
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Style */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">النمط الفني</label>
            <div className="grid grid-cols-2 gap-2">
              {IMAGE_STYLES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-right transition-all',
                    style === s.value
                      ? 'border-pink-500/50 bg-pink-500/15'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  )}
                >
                  <span className="text-base flex-shrink-0">{s.icon}</span>
                  <div className="min-w-0">
                    <p className={cn('text-xs font-medium', style === s.value ? 'text-white' : 'text-slate-300')}>
                      {s.label}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">المقاس</label>
            <div className="grid grid-cols-3 gap-2">
              {IMAGE_SIZES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSize(s.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border py-3 transition-all',
                    size === s.value
                      ? 'border-pink-500/50 bg-pink-500/15'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  )}
                >
                  <span className="text-xl">{s.icon}</span>
                  <p className={cn('text-xs font-medium', size === s.value ? 'text-white' : 'text-slate-300')}>{s.label}</p>
                  <p className="text-[10px] text-slate-500">{s.ratio}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">الجودة</label>
            <div className="grid grid-cols-2 gap-2">
              {QUALITY_OPTIONS.map(q => (
                <button
                  key={q.value}
                  onClick={() => setQuality(q.value)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-right transition-all',
                    quality === q.value
                      ? 'border-pink-500/50 bg-pink-500/15'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  )}
                >
                  <span className="text-lg">{q.icon}</span>
                  <div>
                    <p className={cn('text-xs font-medium', quality === q.value ? 'text-white' : 'text-slate-300')}>{q.label}</p>
                    <p className="text-[10px] text-slate-500">{q.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="btn-primary w-full py-3 mt-1"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                جاري توليد الصورة...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>🎨</span>
                توليد الصورة
              </span>
            )}
          </button>

          {result && !isLoading && (
            <button
              onClick={() => { setResult(null); setError(null) }}
              className="btn-ghost w-full text-xs text-slate-500"
            >
              مسح النتيجة
            </button>
          )}
        </div>

        {/* ===== Result ===== */}
        <div className="flex flex-col gap-4">
          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-pink-500/20 bg-pink-500/5 py-20">
              <div className="relative">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-700 border-t-pink-500" />
                <span className="absolute inset-0 flex items-center justify-center text-2xl">🎨</span>
              </div>
              <p className="mt-4 text-sm font-medium text-white">جاري رسم الصورة...</p>
              <p className="mt-1 text-xs text-slate-400 animate-pulse">
                {selectedStyle?.label} • {selectedSize?.ratio} • قد يستغرق 10-30 ثانية
              </p>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">❌</span>
                <div>
                  <p className="text-sm font-medium text-red-400 mb-1">فشل توليد الصورة</p>
                  <p className="text-xs text-red-300/70">{error}</p>
                  <button
                    onClick={() => handleGenerate()}
                    className="mt-3 btn-secondary text-xs px-3 py-1.5"
                  >
                    حاول مرة أخرى
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && !result && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-800/20 py-20 text-center">
              <span className="text-5xl mb-4 opacity-40">🎨</span>
              <p className="text-sm font-medium text-slate-400 mb-1">ستظهر صورتك هنا</p>
              <p className="text-xs text-slate-600">صف الصورة واضغط على توليد</p>
              <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-xs">
                {PROMPT_EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(ex)}
                    className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-right text-xs text-slate-400 hover:border-pink-500/30 hover:text-slate-300 transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generated Image */}
          {result && !isLoading && (
            <div className="rounded-xl border border-slate-700 overflow-hidden bg-slate-900">
              {/* Image */}
              <div className="relative bg-slate-950">
                <img
                  src={result.imageUrl}
                  alt={prompt}
                  className="w-full object-contain max-h-[500px]"
                  loading="lazy"
                />
                {/* Overlay badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-slate-900/80 backdrop-blur px-3 py-1 text-[11px] text-white">
                  <span>{selectedStyle?.icon}</span>
                  <span>{selectedStyle?.label}</span>
                  <span className="text-slate-500">•</span>
                  <span>{selectedSize?.ratio}</span>
                </div>
              </div>

              {/* Info & Actions */}
              <div className="p-4 space-y-3">
                {/* Revised prompt */}
                {result.revisedPrompt && result.revisedPrompt !== prompt && (
                  <div className="rounded-lg bg-slate-800/50 px-3 py-2">
                    <p className="text-[10px] text-slate-500 mb-1">الـ Prompt المُحسَّن من DALL-E:</p>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {result.revisedPrompt}
                    </p>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span>⚡ {(result.durationMs / 1000).toFixed(1)}s</span>
                  <span>•</span>
                  <span>{result.size}</span>
                  <span>•</span>
                  <span>{quality === 'hd' ? 'HD' : 'Standard'}</span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-pink-600 py-2.5 text-xs font-semibold text-white hover:bg-pink-500 transition-colors"
                  >
                    <span>⬇️</span> تنزيل
                  </button>
                  <button
                    onClick={handleCopyPrompt}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-semibold transition-colors',
                      copied
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                    )}
                  >
                    <span>{copied ? '✅' : '📋'}</span>
                    {copied ? 'تم النسخ' : 'نسخ الـ Prompt'}
                  </button>
                  <button
                    onClick={() => handleGenerate()}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    title="توليد مجدداً"
                  >
                    🔄
                  </button>
                  <Link
                    href="/studios/images/gallery"
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    title="المعرض"
                  >
                    🖼️
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
