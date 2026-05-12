'use client'

import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    info: 'bg-brand-500/10 border-brand-500/30 text-brand-400',
  }

  const icons = { success: '✅', error: '❌', info: 'ℹ️' }

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl transition-all duration-300 ${styles[type]} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      <span>{icons[type]}</span>
      <span>{message}</span>
    </div>
  )
}

// Hook بسيط لإدارة الـ Toast
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  const show = (message: string, type: ToastType = 'success') => {
    setToast({ message, type })
  }

  const hide = () => setToast(null)

  return { toast, show, hide }
}
