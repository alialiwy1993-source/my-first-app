'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { STUDIOS } from '@/lib/constants/studios'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', icon: '🏠', label: 'لوحة التحكم' },
  { href: '/history',   icon: '🕐', label: 'السجل' },
]

// Studio groups for organized sidebar
const STUDIO_GROUPS = [
  {
    label: '📝 النصوص',
    slugs: ['chat', 'articles', 'translation', 'research', 'social'],
  },
  {
    label: '🎬 الإبداع',
    slugs: ['channel-analyzer', 'thumbnails', 'social'],
  },
  {
    label: '🎨 الوسائط',
    slugs: ['images', 'audio', 'video'],
  },
  {
    label: '📚 المعرفة',
    slugs: ['books-tools', 'research', 'channel-analyzer', 'thumbnails'],
  },
]

// Flat ordered list — all 11 studios
const ALL_STUDIOS = STUDIOS.filter((s) => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder)

export default function AppSidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)

  // Show first 6 by default, expand to show all
  const VISIBLE_COUNT = expanded ? ALL_STUDIOS.length : 6
  const visibleStudios = ALL_STUDIOS.slice(0, VISIBLE_COUNT)
  const hiddenCount = ALL_STUDIOS.length - 6

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
        <div className="space-y-0.5 mb-4">
          <Link
            href="/dashboard"
            className={cn('sidebar-item', pathname === '/dashboard' && 'active')}
          >
            <span className="text-base">🏠</span>
            <span>لوحة التحكم</span>
          </Link>
          <Link
            href="/studios"
            className={cn('sidebar-item', pathname === '/studios' && 'active')}
          >
            <span className="text-base">🎬</span>
            <span>الاستوديوهات</span>
          </Link>
          <Link
            href="/history"
            className={cn('sidebar-item', pathname === '/history' && 'active')}
          >
            <span className="text-base">🕐</span>
            <span>السجل</span>
          </Link>
        </div>

        {/* Studios Section */}
        <div className="mb-2 px-3 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            الاستوديوهات
          </p>
          <span className="text-[10px] text-slate-600">{ALL_STUDIOS.length}</span>
        </div>

        <div className="space-y-0.5">
          {visibleStudios.map((studio) => {
            const isActive = pathname.startsWith(studio.href)
            return (
              <Link
                key={studio.slug}
                href={studio.href}
                className={cn(
                  'sidebar-item group',
                  isActive && 'active'
                )}
              >
                <span className="text-base flex-shrink-0">{studio.icon}</span>
                <span className="truncate flex-1 min-w-0">{studio.nameAr}</span>
                {studio.comingSoon && (
                  <span className="flex-shrink-0 rounded-full bg-slate-700 px-1.5 py-0.5 text-[9px] text-slate-400">
                    Beta
                  </span>
                )}
              </Link>
            )
          })}

          {/* Expand/Collapse toggle */}
          {hiddenCount > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="sidebar-item w-full text-brand-400 hover:text-brand-300"
            >
              <span className="text-base">{expanded ? '▲' : '▼'}</span>
              <span className="text-xs">
                {expanded ? 'إخفاء' : `${hiddenCount} استوديو أخرى`}
              </span>
            </button>
          )}
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
