'use client'

import MarkdownRenderer from '@/components/ui/MarkdownRenderer'
import { copyToClipboard } from '@/lib/utils'
import { useState } from 'react'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

interface ChatMessageProps {
  message: ChatMessageType
  isStreaming?: boolean
}

export default function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  const handleCopy = async () => {
    await copyToClipboard(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 group">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-600 px-4 py-3">
          <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white self-end">
          أ
        </div>
      </div>
    )
  }

  if (isAssistant) {
    return (
      <div className="flex gap-3 group">
        {/* Avatar */}
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-purple-600 text-sm self-start mt-1">
          🤖
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl rounded-tl-sm bg-slate-800 border border-slate-700/50 px-4 py-3">
            {isStreaming && !message.content ? (
              /* Typing indicator */
              <div className="flex items-center gap-1 py-1">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
          </div>

          {/* Copy button (on hover) */}
          {!isStreaming && message.content && (
            <button
              onClick={handleCopy}
              className="mt-1 flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all"
            >
              {copied ? '✅ تم النسخ' : '📋 نسخ'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return null
}
