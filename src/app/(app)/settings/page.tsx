import { createClient } from '@/lib/supabase/server'
import { AI_MODELS } from '@/lib/constants/models'

export const metadata = { title: 'الإعدادات' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('preferred_model, preferred_theme')
    .eq('id', user!.id)
    .single()

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">الإعدادات</h1>
        <p className="mt-1 text-sm text-slate-400">تخصيص تجربتك</p>
      </div>

      {/* AI Model */}
      <div className="card space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">نموذج الذكاء الاصطناعي</h3>
          <p className="text-xs text-slate-500 mt-0.5">اختر الموديل المناسب لاحتياجاتك</p>
        </div>
        <div className="grid gap-3">
          {AI_MODELS.map((model) => (
            <div
              key={model.id}
              className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                profile?.preferred_model === model.id
                  ? 'border-brand-500/50 bg-brand-600/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              <div>
                <p className="text-sm font-medium text-white">{model.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{model.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {model.isPremium && (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-400">Pro</span>
                )}
                {profile?.preferred_model === model.id && (
                  <span className="text-brand-400 text-sm">✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          💡 لتغيير الموديل: اذهب إلى الملف الشخصي أو ستتمكن من تغييره من داخل كل استوديو قريباً
        </p>
      </div>

      {/* Theme */}
      <div className="card space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">المظهر</h3>
          <p className="text-xs text-slate-500 mt-0.5">اختر بين الوضع الداكن والفاتح</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'dark', label: '🌙 داكن', desc: 'مريح للعينين' },
            { id: 'light', label: '☀️ فاتح', desc: 'قريباً' },
          ].map((theme) => (
            <div
              key={theme.id}
              className={`rounded-lg border p-4 text-center transition-colors ${
                profile?.preferred_theme === theme.id || (!profile?.preferred_theme && theme.id === 'dark')
                  ? 'border-brand-500/50 bg-brand-600/10'
                  : 'border-slate-700 bg-slate-800/50 opacity-60'
              }`}
            >
              <p className="text-sm font-medium text-white">{theme.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{theme.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
