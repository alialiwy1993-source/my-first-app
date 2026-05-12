import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'تسجيل الدخول',
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center py-6">
        <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
          <span className="text-2xl">🤖</span>
          <span className="text-lg font-bold">AI Universal</span>
        </Link>
      </div>

      {/* Main */}
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          {/* Background glow */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] rounded-full bg-brand-600/8 blur-[80px]" />
          </div>
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  )
}
