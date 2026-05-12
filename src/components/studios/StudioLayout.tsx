import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { StudioConfig } from '@/types/studios'

interface StudioLayoutProps {
  studio: StudioConfig
  children: React.ReactNode
  // Layout: 'split' = form يسار + نتيجة يمين | 'stack' = فوق بعض
  layout?: 'split' | 'stack'
}

export default function StudioLayout({ studio, children, layout = 'split' }: StudioLayoutProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Studio Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/studios"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white transition-colors text-sm"
        >
          →
        </Link>

        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl shadow-lg"
          style={{ background: `${studio.color}20`, boxShadow: `0 0 20px ${studio.color}15` }}
        >
          {studio.icon}
        </div>

        <div>
          <h1 className="text-xl font-bold text-white">{studio.nameAr}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{studio.descriptionAr}</p>
        </div>

        {studio.isPremium && (
          <span className="mr-auto rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400">
            ⭐ Pro
          </span>
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          layout === 'split'
            ? 'grid grid-cols-1 gap-6 lg:grid-cols-2'
            : 'space-y-6'
        )}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * الجانب الأيمن — النموذج
 */
export function StudioFormPanel({ children, title = 'الإعدادات' }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-300">{title}</h2>
        {children}
      </div>
    </div>
  )
}

/**
 * الجانب الأيسر — النتيجة
 */
export function StudioResultPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      {children}
    </div>
  )
}
