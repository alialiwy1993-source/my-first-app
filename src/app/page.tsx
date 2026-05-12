import Link from 'next/link'
import { STUDIOS } from '@/lib/constants/studios'

export default function LandingPage() {
  const featuredStudios = STUDIOS.filter((s) => s.sortOrder <= 6)

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* ===== Navbar ===== */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span className="text-lg font-bold text-white">AI Universal</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="btn-primary text-sm px-4 py-2"
              >
                ابدأ مجاناً
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-16">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/4 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-brand-600/10 blur-[100px]" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-600/10 px-4 py-1.5 text-sm text-brand-300">
            <span>✨</span>
            <span>منصة استوديوهات الذكاء الاصطناعي</span>
          </div>

          <h1 className="mb-6 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            <span className="gradient-text">11 استوديو AI</span>
            <br />
            <span className="text-white">في مكان واحد</span>
          </h1>

          <p className="mb-10 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            منصة شاملة تجمع أدوات الذكاء الاصطناعي — محادثة، مقالات، ترجمة، أبحاث، سوشيال ميديا، صور، صوت، وأكثر.
            بواجهة عربية احترافية ومصمّمة لمساعدتك في إنجاز أكثر.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-primary px-8 py-3 text-base rounded-xl">
              ابدأ مجاناً الآن
            </Link>
            <Link href="/login" className="btn-secondary px-8 py-3 text-base rounded-xl">
              تسجيل الدخول
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-center">
            {[
              { value: '11', label: 'استوديو متخصص' },
              { value: '100%', label: 'واجهة عربية' },
              { value: 'مجاناً', label: 'ابدأ بدون بطاقة' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-3xl font-bold text-white">{stat.value}</span>
                <span className="mt-1 text-sm text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Studios Grid ===== */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-3">الاستوديوهات المتاحة</h2>
            <p className="text-slate-400">كل استوديو مُصمَّم لمهمة محددة بأدوات متخصصة</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredStudios.map((studio) => (
              <div
                key={studio.slug}
                className="studio-card group"
              >
                {/* Gradient overlay on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl"
                  style={{ background: studio.color }}
                />

                <div className="relative">
                  <div
                    className="mb-3 inline-flex items-center justify-center w-11 h-11 rounded-xl text-2xl"
                    style={{ background: `${studio.color}20` }}
                  >
                    {studio.icon}
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">{studio.nameAr}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{studio.descriptionAr}</p>
                </div>
              </div>
            ))}

            {/* More studios card */}
            <div className="studio-card flex items-center justify-center text-center">
              <div>
                <div className="mb-2 text-3xl">🚀</div>
                <p className="text-sm font-medium text-slate-300">
                  +5 استوديوهات إضافية
                </p>
                <p className="text-xs text-slate-500 mt-1">صوت، فيديو، صور، كتب وأكثر</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-2xl border border-brand-500/20 bg-gradient-to-br from-brand-900/30 to-slate-900 p-10">
            <h2 className="text-3xl font-bold text-white mb-4">جاهز للبدء؟</h2>
            <p className="text-slate-400 mb-8">
              أنشئ حسابك مجاناً واستمتع بـ 100 توليد مجاني بدون بطاقة ائتمان
            </p>
            <Link href="/register" className="btn-primary px-8 py-3 text-base rounded-xl">
              إنشاء حساب مجاني
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-slate-800 py-8 px-4 text-center text-sm text-slate-500">
        <p>© 2026 AI Universal Assistant — جميع الحقوق محفوظة</p>
      </footer>
    </main>
  )
}
