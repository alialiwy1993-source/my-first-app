import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// =====================================================
// Utility Functions
// =====================================================

/** دمج class names مع Tailwind */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** تنسيق التاريخ للعربية */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  })
}

/** تنسيق الوقت */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** تنسيق التاريخ النسبي (منذ 5 دقائق...) */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'الآن'
  if (minutes < 60) return `منذ ${minutes} دقيقة`
  if (hours < 24) return `منذ ${hours} ساعة`
  if (days < 7) return `منذ ${days} يوم`
  return formatDate(d)
}

/** تقليص النص */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

/** نسخ النص للحافظة */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    return true
  }
}

/** تنزيل نص كملف */
export function downloadAsText(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** تنسيق حجم الملف */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** إنشاء UUID بسيط (للاستخدام على الـ client فقط) */
export function generateId(): string {
  return crypto.randomUUID()
}

/** التحقق من البريد الإلكتروني */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/** حساب عدد الكلمات */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/** حساب وقت القراءة بالدقائق */
export function readingTime(text: string): number {
  const wordsPerMinute = 200
  return Math.ceil(countWords(text) / wordsPerMinute)
}

/** تحويل عنوان المحادثة من أول رسالة */
export function generateConversationTitle(firstMessage: string): string {
  return truncate(firstMessage, 50)
}

/** تنسيق الأرقام العربية */
export function formatNumber(n: number): string {
  return n.toLocaleString('ar-SA')
}
