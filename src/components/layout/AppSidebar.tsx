'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { STUDIOS } from '@/lib/constants/studios'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', icon: '🏠', label: 'لوحة التحكم' },
  { href: '/studios',   icon: '🎬', label: 'الاستوديوهات' },
  { href: '/history',   icon: '🕐', label: 'السجل' },
]

const QUICK_STUDIOS = STUDIOS.filter((s) => s.sortOrder <= 5 && s.isActive)

export default function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col border-l border-slate-800 bg-slate-900/60">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-slate-800">
        <span className="text-xl">🤖</span>
        <span className="text-sm font-bold text-white">AI Universal</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
        {/* Main Nav */}
        <div className="space-y-0.5 mb-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'sidebar-item',
                pathname === item.href && 'active'
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Studios Section */}
        <div className="mb-2 px-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            الاستوديوهات
          </p>
        </div>
        <div className="space-y-0.5">
          {QUICK_STUDIOS.map((studio) => (
            <Link
              key={studio.slug}
              href={studio.href}
              className={cn(
                'sidebar-item',
                pathname.startsWith(studio.href) && 'active'
              )}
            >
              <span className="text-base">{studio.icon}</span>
              <span className="truncate">{studio.nameAr}</span>
              {studio.comingSoon && (
                <span className="mr-auto rounded-full bg-slate-700 px-1.5 py-0.5 text-[9px] text-slate-400">
                  قريباً
                </span>
              )}
            </Link>
          ))}
          {/* Link to all studios */}
          <Link
            href="/studios"
            className="sidebar-item text-brand-400 hover:text-brand-300"
          >
            <span className="text-base">✨</span>
            <span>عرض الكل</span>
          </Link>
        </div>

        {/* Bottom nav */}
        <div className="mt-6 space-y-0.5 border-t border-slate-800 pt-4">
          <Link
            href="/settings"
            className={cn('sidebar-item', pathname === '/settings' && 'active')}
          >
            <span className="text-base">⚙️</span>
            <span>الإعدادات</span>
          </Link>
          <Link
            href="/profile"
            className={cn('sidebar-item', pathname === '/profile' && 'active')}
          >
            <span className="text-base">👤</span>
            <span>الملف الشخصي</span>
          </Link>
        </div>
      </nav>
    </aside>
  )
}
