import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'الملف الشخصي' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">الملف الشخصي</h1>
        <p className="mt-1 text-sm text-slate-400">معلومات حسابك</p>
      </div>

      {/* Avatar + Name */}
      <div className="card flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white flex-shrink-0">
          {(profile?.full_name ?? user?.email ?? 'U')[0].toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">{profile?.full_name ?? 'مستخدم'}</h2>
          <p className="text-sm text-slate-400">{user?.email}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              profile?.role === 'admin'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-slate-700 text-slate-400'
            }`}>
              {profile?.role === 'admin' ? '🛡️ Admin' : '👤 User'}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              profile?.plan === 'pro'
                ? 'bg-brand-500/20 text-brand-400'
                : 'bg-slate-700 text-slate-400'
            }`}>
              {profile?.plan === 'pro' ? '⭐ Pro' : '🆓 Free'}
            </span>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-white">معلومات الحساب</h3>
        {[
          { label: 'الاسم الكامل', value: profile?.full_name ?? '—' },
          { label: 'البريد الإلكتروني', value: user?.email ?? '—', dir: 'ltr' as const },
          { label: 'تاريخ الانضمام', value: profile?.created_at ? formatDate(profile.created_at) : '—' },
          { label: 'الموديل المفضل', value: profile?.preferred_model ?? 'gpt-4o-mini' },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
            <span className="text-sm text-slate-400">{item.label}</span>
            <span
              className="text-sm text-white font-medium"
              dir={item.dir}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Usage */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4">الاستخدام الحالي</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">التوليدات المستخدمة</span>
            <span className="text-white font-medium">
              {profile?.usage_count ?? 0} / {profile?.usage_limit ?? 100}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-600 to-purple-500 transition-all"
              style={{
                width: `${Math.min(((profile?.usage_count ?? 0) / (profile?.usage_limit ?? 100)) * 100, 100)}%`,
              }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {(profile?.usage_limit ?? 100) - (profile?.usage_count ?? 0)} توليد متبقٍ
          </p>
        </div>
      </div>
    </div>
  )
}
