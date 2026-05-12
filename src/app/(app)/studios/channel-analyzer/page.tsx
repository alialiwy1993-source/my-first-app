'use client'

import { useState } from 'react'
import StudioLayout, { StudioFormPanel, StudioResultPanel } from '@/components/studios/StudioLayout'
import GenerationResult from '@/components/studios/GenerationResult'
import GenerationHistory from '@/components/studios/GenerationHistory'
import { useGeneration } from '@/hooks/useGeneration'
import { getStudio } from '@/lib/constants/studios'
import { cn } from '@/lib/utils'
import type { ChannelPlatform } from '@/lib/openai/prompts/channel-analyzer'

const PLATFORMS: { value: ChannelPlatform; label: string; icon: string; color: string }[] = [
  { value: 'youtube',   label: 'يوتيوب',   icon: '▶️', color: 'border-red-500/50 bg-red-500/15' },
  { value: 'tiktok',    label: 'تيك توك',  icon: '🎵', color: 'border-pink-500/50 bg-pink-500/15' },
  { value: 'instagram', label: 'إنستغرام', icon: '📸', color: 'border-purple-500/50 bg-purple-500/15' },
]

export default function ChannelAnalyzerPage() {
  const studio = getStudio('channel-analyzer')!

  const [platform, setPlatform]             = useState<ChannelPlatform>('youtube')
  const [channelName, setChannelName]       = useState('')
  const [channelUrl, setChannelUrl]         = useState('')
  const [channelDesc, setChannelDesc]       = useState('')
  const [contentType, setContentType]       = useState('')
  const [audience, setAudience]             = useState('')
  const [subscribers, setSubscribers]       = useState('')
  const [avgViews, setAvgViews]             = useState('')
  const [postFreq, setPostFreq]             = useState('')
  const [topContent, setTopContent]         = useState('')
  const [challenges, setChallenges]         = useState('')
  const [activeTab, setActiveTab]           = useState<'generate' | 'history'>('generate')

  const { result, isLoading, error, generate, reset } = useGeneration({ studioSlug: 'channel-analyzer' })

  const canGenerate = channelName.trim().length > 0

  const handleGenerate = async () => {
    if (!canGenerate) return
    await generate({
      platform,
      channelName: channelName.trim(),
      channelUrl: channelUrl.trim() || undefined,
      channelDescription: channelDesc.trim() || undefined,
      contentType: contentType.trim() || undefined,
      targetAudience: audience.trim() || undefined,
      subscribersCount: subscribers.trim() || undefined,
      averageViews: avgViews.trim() || undefined,
      postingFrequency: postFreq.trim() || undefined,
      topVideos: topContent.trim() || undefined,
      challenges: challenges.trim() || undefined,
    })
  }

  return (
    <StudioLayout studio={studio} layout="split">
      <StudioFormPanel title="بيانات القناة">

        {/* Platform */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">المنصة</label>
          <div className="grid grid-cols-3 gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg border py-2.5 text-xs font-medium transition-all',
                  platform === p.value
                    ? p.color + ' text-white'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                )}
              >
                <span className="text-xl">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Channel name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">اسم القناة *</label>
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="مثال: قناة محمد للتقنية"
            className="input-base"
          />
        </div>

        {/* URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">
            رابط القناة <span className="text-slate-600">(اختياري)</span>
          </label>
          <input
            type="text"
            value={channelUrl}
            onChange={(e) => setChannelUrl(e.target.value)}
            placeholder="https://youtube.com/@..."
            className="input-base"
            dir="ltr"
          />
          <p className="text-[10px] text-slate-600">
            💡 ملاحظة: التحليل يعتمد على البيانات المدخلة يدوياً. الربط الفعلي مع YouTube API قادم.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">
            وصف القناة <span className="text-slate-600">(اختياري)</span>
          </label>
          <textarea
            value={channelDesc}
            onChange={(e) => setChannelDesc(e.target.value)}
            placeholder="الصق وصف القناة هنا..."
            rows={3}
            className="input-base resize-none"
          />
        </div>

        {/* Content type & audience */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">نوع المحتوى</label>
            <input
              type="text"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              placeholder="تعليمي، ترفيهي..."
              className="input-base"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">الجمهور</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="شباب، مطورين..."
              className="input-base"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">عدد المشتركين</label>
            <input
              type="text"
              value={subscribers}
              onChange={(e) => setSubscribers(e.target.value)}
              placeholder="مثال: 50,000"
              className="input-base"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">متوسط المشاهدات</label>
            <input
              type="text"
              value={avgViews}
              onChange={(e) => setAvgViews(e.target.value)}
              placeholder="مثال: 5,000"
              className="input-base"
            />
          </div>
        </div>

        {/* Frequency */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">تكرار النشر</label>
          <input
            type="text"
            value={postFreq}
            onChange={(e) => setPostFreq(e.target.value)}
            placeholder="مثال: مرة أسبوعياً، 3 مرات أسبوعياً..."
            className="input-base"
          />
        </div>

        {/* Top content */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">
            أفضل المحتوى <span className="text-slate-600">(اختياري)</span>
          </label>
          <textarea
            value={topContent}
            onChange={(e) => setTopContent(e.target.value)}
            placeholder="اذكر عناوين أفضل فيديوهاتك أو منشوراتك..."
            rows={2}
            className="input-base resize-none"
          />
        </div>

        {/* Challenges */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">
            التحديات الحالية <span className="text-slate-600">(اختياري)</span>
          </label>
          <textarea
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            placeholder="ما أبرز مشاكل قناتك؟ قلة المشتركين، ضعف التفاعل..."
            rows={2}
            className="input-base resize-none"
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
              جاري التحليل...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>📊</span> تحليل القناة
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
              {tab === 'generate' ? '📊 التحليل' : '🕐 السجل'}
            </button>
          ))}
        </div>

        {activeTab === 'generate' ? (
          <GenerationResult
            result={result}
            isLoading={isLoading}
            error={error}
            loadingText="جاري تحليل القناة..."
            studioName="تحليل-قناة"
            onRegenerate={result ? handleGenerate : undefined}
          />
        ) : (
          <GenerationHistory studioSlug="channel-analyzer" />
        )}
      </StudioResultPanel>
    </StudioLayout>
  )
}
