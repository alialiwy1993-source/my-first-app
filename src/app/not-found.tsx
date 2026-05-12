import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <p className="text-slate-400 mb-6">الصفحة التي تبحث عنها غير موجودة</p>
        <Link href="/" className="btn-primary px-6 py-2.5">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  )
}
