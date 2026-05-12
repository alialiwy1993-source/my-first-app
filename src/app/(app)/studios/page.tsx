import Link from 'next/link'
import { getActiveStudios } from '@/lib/constants/studios'

export const metadata = { title: 'الاستوديوهات' }

export default function StudiosPage() {
  const studios = getActiveStudios()

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">الاستوديوهات</h1>
        <p className="mt-1 text-sm text-slate-400">اختر الاستوديو المناسب لمهمتك</p>
      </div>

      {/* Studios Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {studios.map((studio) => (
          <Link
            key={studio.slug}
            href={studio.comingSoon ? '#' : studio.href}
            className={`studio-card group relative ${studio.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {/* Gradient glow on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300 rounded-xl"
              style={{ background: `linear-gradient(135deg, ${studio.color}, transparent)` }}
            />

            <div className="relative flex flex-col h-full">
              {/* Icon + Badge */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-lg"
                  style={{ background: `${studio.color}20`, boxShadow: `0 0 20px ${studio.color}15` }}
                >
                  {studio.icon}
                </div>
                {studio.comingSoon && (
                  <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                    قريباً
                  </span>
                )}
                {studio.isPremium && !studio.comingSoon && (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                    Pro
                  </span>
                )}
              </div>

              {/* Info */}
              <h3 className="text-base font-semibold text-white mb-1.5">{studio.nameAr}</h3>
              <p className="text-sm text-slate-400 leading-relaxed flex-1">{studio.descriptionAr}</p>

              {/* Arrow */}
              {!studio.comingSoon && (
                <div className="mt-4 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color: studio.color }}
                >
                  <span>فتح الاستوديو</span>
                  <span>←</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
