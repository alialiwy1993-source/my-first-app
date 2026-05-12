'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AppTopbarProps {
  userName: string
  userEmail: string
  userRole: string
  usageCount: number
  usageLimit: number
}

export default function AppTopbar({
  userName,
  userEmail,
  userRole,
  usageCount,
  usageLimit,
}: AppTopbarProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const usagePercent = Math.min(Math.round((usageCount / usageLimit) * 100), 100)
  const firstName = userName.split(' ')[0]

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4 sm:px-6">
      {/* Mobile: Logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <span className="text-xl">🤖</span>
        <span className="text-sm font-bold text-white">AI Universal</span>
      </div>

      {/* Desktop: Breadcrumb placeholder */}
      <div className="hidden lg:block">
        <p className="text-sm text-slate-400">
          مرحباً، <span className="text-white font-medium">{firstName}</span> 👋
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Usage indicator */}
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5">
          <div className="h-1.5 w-16 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-500 transition-all"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <span className="text-xs text-slate-400">
            {usageCount}/{usageLimit}
          </span>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 hover:border-slate-600 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
              {firstName[0]?.toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm text-slate-300 max-w-[120px] truncate">
              {firstName}
            </span>
            <span className="text-slate-500 text-xs">▾</span>
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute left-0 z-20 mt-2 w-56 rounded-xl border border-slate-700 bg-slate-800 shadow-xl overflow-hidden">
                {/* User info */}
                <div className="px-4 py-3 border-b border-slate-700">
                  <p className="text-sm font-medium text-white truncate">{userName}</p>
                  <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                  {userRole === 'admin' && (
                    <span className="mt-1 inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-400">
                      Admin
                    </span>
                  )}
                </div>

                {/* Links */}
                <div className="py-1">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>👤</span> الملف الشخصي
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>⚙️</span> الإعدادات
                  </Link>
                  {userRole === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-amber-400 hover:bg-slate-700 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span>🛡️</span> لوحة الإدارة
                    </Link>
                  )}
                </div>

                <div className="border-t border-slate-700 py-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                  >
                    <span>🚪</span> تسجيل الخروج
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
