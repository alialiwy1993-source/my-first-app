'use client'

import { useState } from 'react'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer'
import Spinner from '@/components/ui/Spinner'
import { copyToClipboard, downloadAsText, cn } from '@/lib/utils'
import { useToast, Toast } from '@/components/ui/Toast'

interface GenerationResultProps {
  result: string
  isLoading: boolean
  error: string | null
  loadingText?: string
  studioName?: string
  onRegenerate?: () => void
  className?: string
  // للاستوديوهات التي تريد عرض نص عادي (مثل المحادثة)
  plainText?: boolean
}

export default function GenerationResult({
  result,
  isLoading,
  error,
  loadingText = 'جاري التوليد...',
  studioName = 'نتيجة',
  onRegenerate,
  className,
  plainText = false,
}: GenerationResultProps) {
  const { toast, show, hide } = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!result) return
    const ok = await copyToClipboard(result)
    if (ok) {
      setCopied(true)
      show('تم النسخ!', 'success')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const filename = `${studioName}-${new Date().toISOString().slice(0, 10)}.txt`
    downloadAsText(result, filename)
    show('تم التنزيل!', 'success')
  }

  // حالة التحميل
  if (isLoading) {
    return (
      <div className={cn('flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-800/50 py-16', className)}>
        <Spinner size="lg" className="mb-4" />
        <p className="text-sm text-slate-400 animate-pulse">{loadingText}</p>
        {/* Typing dots */}
        <div className="mt-3 flex gap-1">
          <span className="typing-dot opacity-60" />
          <span className="typing-dot opacity-60" />
          <span className="typing-dot opacity-60" />
        </div>
      </div>
    )
  }

  // حالة الخطأ
  if (error) {
    return (
      <div className={cn('rounded-xl border border-red-500/20 bg-red-500/5 p-6', className)}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">❌</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-400 mb-1">حدث خطأ</p>
            <p className="text-xs text-red-300/70">{error}</p>
            {onRegenerate && (
              <button onClick={onRegenerate} className="mt-3 btn-secondary text-xs px-3 py-1.5">
                حاول مرة أخرى
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // حالة فارغة
  if (!result) {
    return (
      <div className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-800/20 py-16 text-center', className)}>
        <span className="text-4xl mb-3 opacity-50">✨</span>
        <p className="text-sm text-slate-500">ستظهر النتيجة هنا بعد الضغط على توليد</p>
      </div>
    )
  }

  // النتيجة
  return (
    <div className={cn('rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">النتيجة</span>
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400 font-medium">
            جاهز
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <span>🔄</span>
              <span>إعادة</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors',
              copied
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
            )}
          >
            <span>{copied ? '✅' : '📋'}</span>
            <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <span>⬇️</span>
            <span>تنزيل</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 max-h-[600px] overflow-y-auto">
        {plainText ? (
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{result}</p>
        ) : (
          <MarkdownRenderer content={result} />
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
    </div>
  )
}
