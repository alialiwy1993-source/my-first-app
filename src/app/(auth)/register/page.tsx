'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      return
    }
    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="card border-slate-700/50 text-center">
        <div className="mb-4 text-5xl">📧</div>
        <h2 className="text-xl font-bold text-white mb-2">تحقق من بريدك</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          أرسلنا رابط التأكيد إلى <strong className="text-white">{email}</strong>
          <br />
          تحقق من صندوق الوارد وانقر على الرابط للتفعيل.
        </p>
        <Link href="/login" className="btn-primary mt-6 inline-block px-6 py-2.5">
          العودة لتسجيل الدخول
        </Link>
      </div>
    )
  }

  return (
    <div className="card border-slate-700/50">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">إنشاء حساب جديد</h1>
        <p className="mt-2 text-sm text-slate-400">ابدأ مجاناً — لا حاجة لبطاقة ائتمان</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">الاسم الكامل</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="محمد أحمد"
            required
            className="input-base"
          />
        </div>
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
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8 أحرف على الأقل"
            required
            className="input-base"
            dir="ltr"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">تأكيد كلمة المرور</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="input-base"
            dir="ltr"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        لديك حساب بالفعل؟{' '}
        <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">
          تسجيل الدخول
        </Link>
      </p>
    </div>
  )
}
