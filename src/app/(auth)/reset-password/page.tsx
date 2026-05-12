'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleReset = async (e: FormEvent) => {
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
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (success) {
    return (
      <div className="card border-slate-700/50 text-center">
        <div className="mb-4 text-5xl">✅</div>
        <h2 className="text-xl font-bold text-white mb-2">تم التحديث بنجاح</h2>
        <p className="text-slate-400 text-sm">جاري تحويلك للوحة التحكم...</p>
      </div>
    )
  }

  return (
    <div className="card border-slate-700/50">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">تعيين كلمة مرور جديدة</h1>
        <p className="mt-2 text-sm text-slate-400">أدخل كلمة المرور الجديدة</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">كلمة المرور الجديدة</label>
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
          {loading ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
        </button>
      </form>
    </div>
  )
}
