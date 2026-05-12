'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime, copyToClipboard, cn } from '@/lib/utils'
import Spinner from '@/components/ui/Spinner'
import type { GeneratedImage } from '@/types/database'

const STYLE_LABELS: Record<string, string> = {
  realistic: 'واقعي',
  cinematic: 'سينمائي',
  cartoon: 'كرتوني',
  anime: 'أنمي',
  '3d': 'ثلاثي الأبعاد',
  advertising: 'إعلاني',
  youtube_thumbnail: 'يوتيوب',
  social_media: 'سوشيال',
}

const STYLE_ICONS: Record<string, string> = {
  realistic: '📷',
  cinematic: '🎬',
  cartoon: '🎨',
  anime: '⛩️',
  '3d': '🎯',
  advertising: '📢',
  youtube_thumbnail: '▶️',
  social_media: '📱',
}

export default function ImageGalleryPage() {
  const [images, setImages]     = useState<GeneratedImage[]>([])
  const [loading, setLoading]   = useState(true)
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [hasMore, setHasMore]   = useState(false)
  const [filter, setFilter]     = useState<string>('all')
  const [selected, setSelected] = useState<GeneratedImage | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Stable supabase client ref
  const supabaseRef = useState(() => createClient())[0]

  const fetchImages = useCallback(async (pageNum = 1, styleFilter = 'all') => {
    setLoading(true)
    try {
      let query = supabaseRef
        .from('generated_images')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((pageNum - 1) * 20, pageNum * 20 - 1)

      if (styleFilter !== 'all') {
        query = query.eq('style', styleFilter)
      }

      const { data, error, count } = await query

      if (error) throw error

      if (pageNum === 1) {
        setImages((data ?? []) as GeneratedImage[])
      } else {
        setImages(prev => [...prev, ...(data ?? []) as GeneratedImage[]])
      }

      setTotal(count ?? 0)
      setHasMore((count ?? 0) > pageNum * 20)
    } catch (err) {
      console.error('Failed to fetch images:', err)
    } finally {
      setLoading(false)
    }
  }, [supabaseRef])

  useEffect(() => {
    setPage(1)
    fetchImages(1, filter)
  }, [filter, fetchImages])

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return
    await supabaseRef.from('generated_images').delete().eq('id', id)
    setImages(prev => prev.filter(img => img.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const handleFavorite = async (id: string, current: boolean) => {
    await supabaseRef.from('generated_images').update({ is_favorite: !current }).eq('id', id)
    setImages(prev => prev.map(img => img.id === id ? { ...img, is_favorite: !current } : img))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, is_favorite: !current } : null)
  }

  const handleCopyPrompt = async (img: GeneratedImage) => {
    await copyToClipboard(img.prompt)
    setCopiedId(img.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl)
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
      window.open(imageUrl, '_blank')
    }
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchImages(nextPage, filter)
  }

  // All unique styles for filter
  const availableStyles = ['all', ...Object.keys(STYLE_LABELS)]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <Link
          href="/studios/images"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white transition-colors text-sm"
        >
          →
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">معرض الصور</h1>
          <p className="text-xs text-slate-400 mt-0.5">{total} صورة مُولَّدة</p>
        </div>
        <Link
          href="/studios/images"
          className="mr-auto flex items-center gap-1.5 rounded-lg bg-pink-600 px-4 py-2 text-xs font-semibold text-white hover:bg-pink-500 transition-colors"
        >
          <span>🎨</span> توليد صورة جديدة
        </Link>
      </div>

      {/* Style filter */}
      <div className="flex flex-wrap gap-2">
        {availableStyles.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs transition-all',
              filter === s
                ? 'border-pink-500/50 bg-pink-500/20 text-pink-300 font-medium'
                : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
            )}
          >
            {s === 'all' ? '✨ الكل' : `${STYLE_ICONS[s] ?? ''} ${STYLE_LABELS[s] ?? s}`}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && images.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {/* Empty state */}
      {!loading && images.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-20 text-center">
          <span className="text-5xl mb-4">🖼️</span>
          <h3 className="text-lg font-semibold text-white mb-2">المعرض فارغ</h3>
          <p className="text-sm text-slate-400 mb-6">
            {filter === 'all' ? 'لم تولّد أي صور بعد' : `لا توجد صور بنمط "${STYLE_LABELS[filter]}"`}
          </p>
          <Link href="/studios/images" className="btn-primary px-6">
            🎨 توليد صورتك الأولى
          </Link>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map(img => (
            <div
              key={img.id}
              className="group relative rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900 cursor-pointer hover:border-pink-500/30 transition-all"
              onClick={() => setSelected(img)}
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-slate-950">
                <img
                  src={img.image_url}
                  alt={img.prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-white text-sm font-medium bg-black/50 backdrop-blur px-3 py-1 rounded-full">
                    عرض
                  </span>
                </div>

                {/* Favorite badge */}
                {img.is_favorite && (
                  <div className="absolute top-2 right-2 text-amber-400 text-sm">⭐</div>
                )}

                {/* Style badge */}
                <div className="absolute bottom-2 right-2 rounded-full bg-black/60 backdrop-blur px-2 py-0.5 text-[10px] text-white">
                  {STYLE_ICONS[img.style ?? ''] ?? '🎨'} {STYLE_LABELS[img.style ?? ''] ?? img.style}
                </div>
              </div>

              {/* Prompt preview */}
              <div className="p-2">
                <p className="text-[11px] text-slate-400 truncate">{img.prompt}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{formatRelativeTime(img.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMore}
            disabled={loading}
            className="btn-secondary px-6 py-2"
          >
            {loading ? <Spinner size="sm" /> : 'تحميل المزيد'}
          </button>
        </div>
      )}

      {/* ===== Image Modal ===== */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 left-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              ✕
            </button>

            {/* Image */}
            <div className="bg-slate-950">
              <img
                src={selected.image_url}
                alt={selected.prompt}
                className="w-full object-contain max-h-[60vh] rounded-t-2xl"
              />
            </div>

            {/* Details */}
            <div className="p-5 space-y-4">
              {/* Style & Size */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs text-pink-300">
                  {STYLE_ICONS[selected.style ?? ''] ?? '🎨'} {STYLE_LABELS[selected.style ?? ''] ?? selected.style}
                </span>
                {selected.size && (
                  <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-300">
                    📐 {selected.size}
                  </span>
                )}
                <span className="text-[11px] text-slate-500">
                  {formatRelativeTime(selected.created_at)}
                </span>
              </div>

              {/* Prompt */}
              <div className="rounded-lg bg-slate-800 p-3">
                <p className="text-[10px] text-slate-500 mb-1">الوصف الأصلي:</p>
                <p className="text-sm text-slate-200 leading-relaxed">{selected.prompt}</p>
              </div>

              {/* Revised prompt (from metadata) */}
              {selected.metadata && typeof selected.metadata === 'object' &&
                'revised_prompt' in selected.metadata &&
                (selected.metadata as { revised_prompt?: string }).revised_prompt !== selected.prompt && (
                <div className="rounded-lg bg-slate-800/50 p-3">
                  <p className="text-[10px] text-slate-500 mb-1">الـ Prompt المُحسَّن من DALL-E:</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {(selected.metadata as { revised_prompt?: string }).revised_prompt}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleDownload(selected.image_url, selected.prompt)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-pink-600 py-2.5 text-sm font-semibold text-white hover:bg-pink-500 transition-colors"
                >
                  ⬇️ تنزيل
                </button>
                <button
                  onClick={() => handleCopyPrompt(selected)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition-colors',
                    copiedId === selected.id
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                      : 'border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                  )}
                >
                  {copiedId === selected.id ? '✅ تم النسخ' : '📋 نسخ الـ Prompt'}
                </button>
                <button
                  onClick={() => handleFavorite(selected.id, selected.is_favorite)}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors',
                    selected.is_favorite
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                      : 'border-slate-600 bg-slate-700 text-slate-400 hover:text-amber-400'
                  )}
                >
                  {selected.is_favorite ? '⭐' : '☆'}
                </button>
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="flex items-center justify-center rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/15 transition-colors"
                >
                  🗑️
                </button>
              </div>

              {/* Use in Image Studio */}
              <Link
                href={`/studios/images?prompt=${encodeURIComponent(selected.prompt)}`}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 py-2.5 text-xs text-slate-400 hover:border-slate-600 hover:text-slate-300 transition-colors"
              >
                🔄 استخدام الـ Prompt في استوديو الصور
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
