'use client'

import type { KeyboardEvent } from 'react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import Spinner from '@/components/ui/Spinner'

interface ChatInputProps {
  onSend: (message: string) => void
  onStop: () => void
  isLoading: boolean
  disabled?: boolean
  placeholder?: string
}

export default function ChatInput({
  onSend,
  onStop,
  isLoading,
  disabled = false,
  placeholder = 'اكتب رسالتك هنا... (Enter للإرسال، Shift+Enter لسطر جديد)',
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
  }, [value])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    const msg = value.trim()
    if (!msg || isLoading || disabled) return
    onSend(msg)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  return (
    <div className="border-t border-slate-800 bg-slate-900/80 px-4 py-3">
      <div className="flex items-end gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 focus-within:border-brand-500/50 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-white placeholder-slate-500 outline-none leading-relaxed max-h-48 overflow-y-auto no-scrollbar"
          style={{ direction: 'rtl' }}
        />

        {/* Char count */}
        {value.length > 500 && (
          <span className={cn('text-[10px] flex-shrink-0', value.length > 9000 ? 'text-red-400' : 'text-slate-500')}>
            {value.length}/10000
          </span>
        )}

        {/* Send / Stop button */}
        {isLoading ? (
          <button
            onClick={onStop}
            className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
            title="إيقاف"
          >
            ⏹
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className={cn(
              'flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg transition-all',
              value.trim() && !disabled
                ? 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-600/20'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            )}
            title="إرسال (Enter)"
          >
            ↑
          </button>
        )}
      </div>

      <p className="mt-1.5 text-center text-[10px] text-slate-600">
        Enter للإرسال • Shift+Enter لسطر جديد
      </p>
    </div>
  )
}
