'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
    })

    if (resetError) {
      setError('حدث خطأ. تحقق من البريد الإلكتروني.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="card border-slate-700/50 text-center">
        <div className="mb-4 text-5xl">✅</div>
        <h2 className="text-xl font-bold text-white mb-2">تم الإرسال</h2>
        <p className="text-slate-400 text-sm">
          أرسلنا رابط إعادة التعيين إلى <strong className="text-white">{email}</strong>
        </p>
        <Link href="/login" className="btn-secondary mt-6 inline-block px-6 py-2.5">
          العودة لتسجيل الدخول
        </Link>
      </div>
    )
  }

  return (
    <div className="card border-slate-700/50">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">نسيت كلمة المرور؟</h1>
        <p className="mt-2 text-sm text-slate-400">أدخل بريدك وسنرسل لك رابط الاستعادة</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
            className="input-base"
            dir="ltr"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        <Link href="/login" className="text-brand-400 hover:text-brand-300">
          ← العودة لتسجيل الدخول
        </Link>
      </p>
    </div>
  )
}
