'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { StudioGeneration } from '@/types/database'
import { formatRelativeTime, truncate, copyToClipboard, downloadAsText } from '@/lib/utils'
import Spinner from '@/components/ui/Spinner'
import { useToast, Toast } from '@/components/ui/Toast'

interface GenerationHistoryProps {
  studioSlug: string
  limit?: number
}

export default function GenerationHistory({ studioSlug, limit = 20 }: GenerationHistoryProps) {
  const [generations, setGenerations] = useState<StudioGeneration[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const { toast, show, hide } = useToast()

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('studio_generations')
        .select('*')
        .eq('studio_slug', studioSlug)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(limit)

      setGenerations((data as StudioGeneration[]) ?? [])
      setLoading(false)
    }
    load()
  }, [studioSlug, limit])

  const handleCopy = async (output: string) => {
    await copyToClipboard(output)
    show('تم النسخ!', 'success')
  }

  const handleDownload = (output: string, title: string) => {
    downloadAsText(output, `${title || studioSlug}-${new Date().toISOString().slice(0, 10)}.txt`)
    show('تم التنزيل!', 'success')
  }

  const toggleFavorite = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase
      .from('studio_generations')
      .update({ is_favorite: !current })
      .eq('id', id)
    setGenerations(prev => prev.map(g => g.id === id ? { ...g, is_favorite: !current } : g))
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('studio_generations').update({ is_archived: true }).eq('id', id)
    setGenerations(prev => prev.filter(g => g.id !== id))
    show('تم الحذف', 'info')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (generations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-12 text-center">
        <span className="text-3xl mb-2">📭</span>
        <p className="text-sm text-slate-500">لا توجد توليدات سابقة</p>
        <p className="text-xs text-slate-600 mt-1">ستظهر هنا بعد أول توليد</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {generations.map(gen => (
        <div
          key={gen.id}
          className="rounded-xl border border-slate-700/50 bg-slate-800/50 overflow-hidden"
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-800/80 transition-colors"
            onClick={() => setExpanded(expanded === gen.id ? null : gen.id)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {gen.title || `توليد ${formatRelativeTime(gen.created_at)}`}
              </p>
              {gen.output && (
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {truncate(gen.output.replace(/[#*`]/g, ''), 80)}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Favorite */}
              <button
                onClick={e => { e.stopPropagation(); toggleFavorite(gen.id, gen.is_favorite) }}
                className={`text-sm transition-colors ${gen.is_favorite ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'}`}
              >
                {gen.is_favorite ? '⭐' : '☆'}
              </button>

              {/* Expand toggle */}
              <span className="text-xs text-slate-500">
                {expanded === gen.id ? '▲' : '▼'}
              </span>
            </div>
          </div>

          {/* Expanded content */}
          {expanded === gen.id && gen.output && (
            <div className="border-t border-slate-700/50">
              {/* Actions */}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
                <span className="text-[10px] text-slate-500 flex-1">
                  {formatRelativeTime(gen.created_at)}
                  {gen.tokens_used > 0 && ` • ${gen.tokens_used} رمز`}
                </span>
                <button
                  onClick={() => handleCopy(gen.output!)}
                  className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  📋 نسخ
                </button>
                <button
                  onClick={() => handleDownload(gen.output!, gen.title || studioSlug)}
                  className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  ⬇️ تنزيل
                </button>
                <button
                  onClick={() => handleDelete(gen.id)}
                  className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-red-400 hover:bg-slate-700 transition-colors"
                >
                  🗑️
                </button>
              </div>

              {/* Content preview */}
              <div className="px-4 py-3 max-h-48 overflow-y-auto">
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {gen.output}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
    </div>
  )
}
