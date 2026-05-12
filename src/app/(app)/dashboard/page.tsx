import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getActiveStudios } from '@/lib/constants/studios'
import { formatRelativeTime } from '@/lib/utils'

export const metadata = { title: 'لوحة التحكم' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // إحصائيات
  const [generationsRes, conversationsRes, profileRes] = await Promise.all([
    supabase
      .from('studio_generations')
      .select('id, studio_slug, title, created_at', { count: 'exact' })
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('conversations')
      .select('id', { count: 'exact' })
      .eq('user_id', user!.id),
    supabase
      .from('profiles')
      .select('usage_count, usage_limit, plan')
      .eq('id', user!.id)
      .single(),
  ])

  const totalGenerations = generationsRes.count ?? 0
  const totalConversations = conversationsRes.count ?? 0
  const profile = profileRes.data
  const recentGenerations = generationsRes.data ?? []
  const studios = getActiveStudios().slice(0, 6)

  const stats = [
    { label: 'إجمالي التوليدات', value: totalGenerations, icon: '✨', color: 'text-brand-400' },
    { label: 'المحادثات', value: totalConversations, icon: '💬', color: 'text-emerald-400' },
    { label: 'الاستخدام', value: `${profile?.usage_count ?? 0}/${profile?.usage_limit ?? 100}`, icon: '📊', color: 'text-amber-400' },
    { label: 'الخطة', value: profile?.plan === 'pro' ? 'Pro ⭐' : 'مجاني', icon: '🎯', color: 'text-purple-400' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-slate-400">مرحباً! هنا نظرة عامة على نشاطك</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className={`text-2xl mb-1 ${stat.color}`}>{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Access Studios */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">وصول سريع للاستوديوهات</h2>
            <Link href="/studios" className="text-xs text-brand-400 hover:text-brand-300">
              عرض الكل ←
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {studios.map((studio) => (
              <Link
                key={studio.slug}
                href={studio.href}
                className="studio-card group flex items-center gap-3 p-4"
              >
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-lg"
                  style={{ background: `${studio.color}20` }}
                >
                  {studio.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{studio.nameAr}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">آخر النشاطات</h2>
            <Link href="/history" className="text-xs text-brand-400 hover:text-brand-300">
              السجل الكامل ←
            </Link>
          </div>
          <div className="card p-0 overflow-hidden">
            {recentGenerations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <span className="text-3xl mb-2">🌟</span>
                <p className="text-sm text-slate-400">لا توجد نشاطات بعد</p>
                <Link href="/studios" className="mt-3 text-xs text-brand-400 hover:text-brand-300">
                  ابدأ أول استوديو →
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-800">
                {recentGenerations.map((gen) => (
                  <li key={gen.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 truncate">
                        {gen.title ?? `توليد ${gen.studio_slug}`}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatRelativeTime(gen.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
