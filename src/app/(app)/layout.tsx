import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppSidebar from '@/components/layout/AppSidebar'
import AppTopbar from '@/components/layout/AppTopbar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // جلب الـ profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, role, plan, usage_count, usage_limit')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          userName={profile?.full_name ?? user.email ?? 'مستخدم'}
          userEmail={user.email ?? ''}
          userRole={profile?.role ?? 'user'}
          usageCount={profile?.usage_count ?? 0}
          usageLimit={profile?.usage_limit ?? 100}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
