'use client'

import { useState, useRef, useCallback, useEffect, type FormEvent } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn, copyToClipboard, formatRelativeTime, truncate } from '@/lib/utils'
import Spinner from '@/components/ui/Spinner'
import { useToast, Toast } from '@/components/ui/Toast'

// =====================================================
// Config
// =====================================================
const VOICES = [
  { value: 'alloy',   label: 'Alloy',   desc: 'محايد وواضح',        icon: '🎙️' },
  { value: 'echo',    label: 'Echo',    desc: 'ذكوري هادئ',         icon: '🔊' },
  { value: 'fable',   label: 'Fable',   desc: 'ذكوري بريطاني',      icon: '📖' },
  { value: 'onyx',    label: 'Onyx',    desc: 'ذكوري عميق',         icon: '🎵' },
  { value: 'nova',    label: 'Nova',    desc: 'أنثوي حيوي',         icon: '✨' },
  { value: 'shimmer', label: 'Shimmer', desc: 'أنثوي ناعم',         icon: '💫' },
]

const MODELS = [
  { value: 'tts-1',    label: 'Standard', desc: 'أسرع وأقل تكلفة',        icon: '⚡' },
  { value: 'tts-1-hd', label: 'HD',       desc: 'جودة عالية أكثر وضوحاً', icon: '💎' },
]

const SPEED_OPTIONS = [
  { value: 0.75, label: 'بطيء' },
  { value: 1.0,  label: 'طبيعي' },
  { value: 1.25, label: 'سريع' },
  { value: 1.5,  label: 'أسرع' },
]

const EXAMPLE_TEXTS = [
  'مرحباً بكم في منصة الذكاء الاصطناعي. هذا مثال على تحويل النص إلى صوت باللغة العربية.',
  'السلام عليكم ورحمة الله وبركاته. أهلاً وسهلاً بكم في هذا البرنامج.',
  'يُعدّ الذكاء الاصطناعي من أبرز تقنيات القرن الحادي والعشرين التي تُحدث ثورة في شتى المجالات.',
]

interface GeneratedAudio {
  audioUrl: string
  storagePath: string | null
  voice: string
  speed: number
  model: string
  durationMs: number
  fileSizeBytes: number
  storageUsed: boolean
  id: string | null
}

interface SavedAudio {
  id: string
  text_input: string
  voice: string | null
  language: string
  audio_url: string
  storage_path: string | null
  speed: number | null
  created_at: string
}

export default function AudioStudioPage() {
  const [text, setText]         = useState('')
  const [voice, setVoice]       = useState('alloy')
  const [model, setModel]       = useState('tts-1')
  const [speed, setSpeed]       = useState(1.0)
  const [language, setLanguage] = useState('ar')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [result, setResult]     = useState<GeneratedAudio | null>(null)
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate')
  const [history, setHistory]   = useState<SavedAudio[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [copiedText, setCopiedText] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast, show, hide } = useToast()
  const supabaseRef = useState(() => createClient())[0]

  const charCount = text.length
  const isOverLimit = charCount > 4096

  // Load history
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const { data } = await supabaseRef
        .from('generated_audio')
        .select('id, text_input, voice, language, audio_url, storage_path, speed, created_at')
        .order('created_at', { ascending: false })
        .limit(20)
      setHistory((data ?? []) as SavedAudio[])
    } catch { /* silent */ }
    finally { setHistoryLoading(false) }
  }, [supabaseRef])

  useEffect(() => {
    if (activeTab === 'history') loadHistory()
  }, [activeTab, loadHistory])

  const handleGenerate = useCallback(async (e?: FormEvent) => {
    e?.preventDefault()
    if (!text.trim() || isLoading || isOverLimit) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), voice, speed, language, model }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'خطأ في توليد الصوت')
      setResult(data as GeneratedAudio)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }, [text, voice, speed, language, model, isLoading, isOverLimit])

  const handleDownload = async () => {
    if (!result?.audioUrl) return
    try {
      let url = result.audioUrl
      let blobUrl = url

      if (!url.startsWith('data:')) {
        const r = await fetch(url)
        const blob = await r.blob()
        blobUrl = URL.createObjectURL(blob)
      }

      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `audio-${Date.now()}.mp3`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      if (!url.startsWith('data:')) URL.revokeObjectURL(blobUrl)
      show('تم التنزيل!', 'success')
    } catch {
      show('فشل التنزيل. حاول مرة أخرى.', 'error')
    }
  }

  const handleCopyText = async () => {
    await copyToClipboard(text)
    setCopiedText(true)
    show('تم نسخ النص!', 'success')
    setTimeout(() => setCopiedText(false), 2000)
  }

  const selectedVoice = VOICES.find(v => v.value === voice)

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
          style={{ background: '#14b8a620', boxShadow: '0 0 20px #14b8a615' }}
        >
          🔊
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">استوديو توليد الصوت</h1>
          <p className="text-xs text-slate-400 mt-0.5">حوّل نصوصك إلى صوت احترافي</p>
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
            {tab === 'generate' ? '🔊 التوليد' : '🕐 السجل'}
          </button>
        ))}
      </div>

      {/* ===== Generate Tab ===== */}
      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Form */}
          <div className="space-y-4 rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
            <h2 className="text-sm font-semibold text-slate-300">إعدادات الصوت</h2>

            {/* Text input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400">النص *</label>
                <span className={cn('text-[10px]', isOverLimit ? 'text-red-400' : 'text-slate-500')}>
                  {charCount}/4096
                </span>
              </div>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="أدخل النص الذي تريد تحويله إلى صوت..."
                rows={5}
                className={cn('input-base resize-none', isOverLimit && 'border-red-500/50')}
                maxLength={4200}
              />
              {/* Example texts */}
              <div className="flex flex-wrap gap-1">
                {EXAMPLE_TEXTS.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setText(ex)}
                    className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] text-slate-500 hover:border-slate-600 hover:text-slate-300 transition-colors"
                  >
                    مثال {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">نوع الصوت</label>
              <div className="grid grid-cols-3 gap-2">
                {VOICES.map(v => (
                  <button
                    key={v.value}
                    onClick={() => setVoice(v.value)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-lg border py-2.5 text-xs transition-all',
                      voice === v.value
                        ? 'border-teal-500/50 bg-teal-500/15 text-white'
                        : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    <span className="text-lg">{v.icon}</span>
                    <span className="font-medium">{v.label}</span>
                    <span className="text-[10px] text-center text-slate-500 leading-tight">{v.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Model */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">جودة الصوت</label>
              <div className="grid grid-cols-2 gap-2">
                {MODELS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setModel(m.value)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-all',
                      model === m.value
                        ? 'border-teal-500/50 bg-teal-500/15'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    )}
                  >
                    <span className="text-lg">{m.icon}</span>
                    <div>
                      <p className={cn('text-xs font-medium', model === m.value ? 'text-white' : 'text-slate-300')}>{m.label}</p>
                      <p className="text-[10px] text-slate-500">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Speed */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">
                السرعة: <span className="text-white font-medium">{speed}x</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {SPEED_OPTIONS.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setSpeed(s.value)}
                    className={cn(
                      'rounded-lg border py-1.5 text-xs text-center transition-all',
                      speed === s.value
                        ? 'border-teal-500/50 bg-teal-500/15 text-white font-medium'
                        : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">اللغة</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="input-base"
              >
                <option value="ar">🇸🇦 العربية</option>
                <option value="en">🇺🇸 الإنجليزية</option>
                <option value="fr">🇫🇷 الفرنسية</option>
                <option value="de">🇩🇪 الألمانية</option>
                <option value="es">🇪🇸 الإسبانية</option>
              </select>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !text.trim() || isOverLimit}
              className="btn-primary w-full py-3 mt-1"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  جاري تحويل النص إلى صوت...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🔊</span>
                  توليد الصوت
                </span>
              )}
            </button>

            {result && !isLoading && (
              <button onClick={() => { setResult(null); setError(null) }} className="btn-ghost w-full text-xs text-slate-500">
                مسح النتيجة
              </button>
            )}
          </div>

          {/* Result */}
          <div className="flex flex-col gap-4">
            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/5 py-20">
                <div className="relative mb-4">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-700 border-t-teal-500" />
                  <span className="absolute inset-0 flex items-center justify-center text-2xl">🔊</span>
                </div>
                <p className="text-sm font-medium text-white">جاري تحويل النص إلى صوت...</p>
                <p className="mt-1 text-xs text-slate-400 animate-pulse">
                  صوت {selectedVoice?.label} • قد يستغرق 5-15 ثانية
                </p>
              </div>
            )}

            {/* Error */}
            {error && !isLoading && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">❌</span>
                  <div>
                    <p className="text-sm font-medium text-red-400 mb-1">فشل التوليد</p>
                    <p className="text-xs text-red-300/70">{error}</p>
                    <button onClick={() => handleGenerate()} className="mt-3 btn-secondary text-xs px-3 py-1.5">
                      حاول مرة أخرى
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty */}
            {!isLoading && !error && !result && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-800/20 py-20 text-center">
                <span className="text-5xl mb-4 opacity-40">🔊</span>
                <p className="text-sm font-medium text-slate-400 mb-1">ستظهر النتيجة هنا</p>
                <p className="text-xs text-slate-600">أدخل النص واضغط على توليد</p>
              </div>
            )}

            {/* Result card */}
            {result && !isLoading && (
              <div className="rounded-xl border border-teal-500/20 bg-slate-900 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-700/50 bg-slate-800/80 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-teal-400 text-lg">✅</span>
                    <span className="text-sm font-medium text-white">الصوت جاهز</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>{selectedVoice?.label}</span>
                    <span>•</span>
                    <span>{result.speed}x</span>
                    <span>•</span>
                    <span>{(result.fileSizeBytes / 1024).toFixed(0)} KB</span>
                    <span>•</span>
                    <span>{(result.durationMs / 1000).toFixed(1)}s</span>
                  </div>
                </div>

                {/* Audio Player */}
                <div className="p-4 space-y-4">
                  <div className="rounded-lg bg-slate-800 p-3">
                    <audio
                      ref={audioRef}
                      controls
                      className="w-full"
                      src={result.audioUrl}
                      preload="auto"
                    >
                      متصفحك لا يدعم تشغيل الصوت
                    </audio>
                  </div>

                  {/* Storage badge */}
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-medium',
                      result.storageUsed
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    )}>
                      {result.storageUsed ? '☁️ محفوظ في السحابة' : '💾 مباشر (غير محفوظ)'}
                    </span>
                    {!result.storageUsed && (
                      <p className="text-[10px] text-slate-500">
                        نزّله الآن لأن الرابط مؤقت
                      </p>
                    )}
                  </div>

                  {/* Text preview */}
                  <div className="rounded-lg bg-slate-800/50 p-3">
                    <p className="text-[10px] text-slate-500 mb-1">النص المحوَّل:</p>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{text}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 py-2.5 text-xs font-semibold text-white hover:bg-teal-500 transition-colors"
                    >
                      ⬇️ تنزيل MP3
                    </button>
                    <button
                      onClick={handleCopyText}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-semibold transition-colors',
                        copiedText
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                          : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                      )}
                    >
                      {copiedText ? '✅ تم النسخ' : '📋 نسخ النص'}
                    </button>
                    <button
                      onClick={() => handleGenerate()}
                      className="flex items-center justify-center rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                      title="توليد مجدداً"
                    >
                      🔄
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== History Tab ===== */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {historyLoading && (
            <div className="flex items-center justify-center py-12"><Spinner /></div>
          )}
          {!historyLoading && history.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-16 text-center">
              <span className="text-4xl mb-3">🔊</span>
              <p className="text-sm text-slate-400">لا توجد ملفات صوت سابقة</p>
              <button
                onClick={() => setActiveTab('generate')}
                className="mt-4 btn-primary px-4 py-2 text-xs"
              >
                ابدأ التوليد
              </button>
            </div>
          )}
          {history.map(item => (
            <div key={item.id} className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🔊</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{truncate(item.text_input, 80)}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                    <span>صوت: {item.voice}</span>
                    <span>•</span>
                    <span>{item.language}</span>
                    {item.speed && <><span>•</span><span>{item.speed}x</span></>}
                    <span>•</span>
                    <span>{formatRelativeTime(item.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
    </div>
  )
}
