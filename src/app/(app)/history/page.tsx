import { createClient } from '@/lib/supabase/server'
import { formatRelativeTime, truncate } from '@/lib/utils'
import { getStudio } from '@/lib/constants/studios'
import Link from 'next/link'

export const metadata = { title: 'سجل التوليدات' }

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: generations } = await supabase
    .from('studio_generations')
    .select('*')
    .eq('user_id', user!.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">سجل التوليدات</h1>
        <p className="mt-1 text-sm text-slate-400">
          {generations?.length ?? 0} توليد محفوظ
        </p>
      </div>

      {!generations || generations.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl mb-4">✨</span>
          <h3 className="text-lg font-semibold text-white mb-2">لا توجد توليدات بعد</h3>
          <p className="text-sm text-slate-400 mb-6">ابدأ باستخدام أحد الاستوديوهات</p>
          <Link href="/studios" className="btn-primary px-6">
            اكتشف الاستوديوهات
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {generations.map((gen) => {
            const studio = getStudio(gen.studio_slug)
            return (
              <div
                key={gen.id}
                className="card hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Studio icon */}
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-lg"
                    style={{ background: studio ? `${studio.color}20` : '#334155' }}
                  >
                    {studio?.icon ?? '✨'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white truncate">
                        {gen.title ?? `توليد ${gen.studio_slug}`}
                      </span>
                      {gen.is_favorite && <span className="text-amber-400 text-xs">⭐</span>}
                    </div>
                    {gen.output && (
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {truncate(gen.output, 150)}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                      <span>{studio?.nameAr ?? gen.studio_slug}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(gen.created_at)}</span>
                      {gen.tokens_used > 0 && (
                        <>
                          <span>•</span>
                          <span>{gen.tokens_used} رمز</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
