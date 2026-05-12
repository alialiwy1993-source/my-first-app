'use client'

import { useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import type { ChatMessage as ChatMessageType } from '@/types/chat'
import type { AssistantType } from '@/types/database'
import { ASSISTANT_TYPES } from '@/types/chat'

interface ChatWindowProps {
  messages: ChatMessageType[]
  isLoading: boolean
  onSend: (message: string) => void
  onStop: () => void
  assistantType: AssistantType
  onAssistantTypeChange: (type: AssistantType) => void
  conversationTitle?: string
}

export default function ChatWindow({
  messages,
  isLoading,
  onSend,
  onStop,
  assistantType,
  onAssistantTypeChange,
  conversationTitle,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const assistantInfo = ASSISTANT_TYPES[assistantType]

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg">💬</span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white truncate">
              {conversationTitle || 'محادثة جديدة'}
            </h2>
            <p className="text-xs text-slate-500">{assistantInfo.label}</p>
          </div>
        </div>

        {/* Assistant type selector */}
        <select
          value={assistantType}
          onChange={e => onAssistantTypeChange(e.target.value as AssistantType)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-slate-300 outline-none hover:border-slate-600 focus:border-brand-500 transition-colors cursor-pointer"
        >
          {Object.entries(ASSISTANT_TYPES).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" ref={bottomRef}>
        {messages.length === 0 ? (
          <WelcomeScreen assistantType={assistantType} onPromptClick={onSend} />
        ) : (
          messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isStreaming={isLoading && idx === messages.length - 1 && msg.role === 'assistant'}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={onSend}
        onStop={onStop}
        isLoading={isLoading}
      />
    </div>
  )
}

// شاشة ترحيب مع أمثلة
function WelcomeScreen({
  assistantType,
  onPromptClick,
}: {
  assistantType: AssistantType
  onPromptClick: (p: string) => void
}) {
  const info = ASSISTANT_TYPES[assistantType]

  const EXAMPLE_PROMPTS: Record<AssistantType, string[]> = {
    general: [
      'ما هي أبرز اتجاهات الذكاء الاصطناعي في 2025؟',
      'اشرح لي مفهوم التعلم الآلي بأسلوب بسيط',
      'اقترح لي 5 كتب مفيدة في تطوير الذات',
    ],
    coder: [
      'اكتب لي دالة Python لفرز قائمة بالـ Merge Sort',
      'ما الفرق بين Promise.all و Promise.allSettled؟',
      'راجع هذا الكود وأخبرني بمشاكله: ...',
    ],
    business: [
      'ساعدني في كتابة خطة عمل لمشروع تقني',
      'كيف أسوّق منتجي الرقمي بميزانية محدودة؟',
      'اكتب لي تحليل SWOT لشركة ناشئة في مجال التعليم',
    ],
    study: [
      'اشرح لي نظرية النسبية الخاصة بمثال بسيط',
      'ساعدني في فهم خوارزميات البحث والترتيب',
      'أنشئ لي 10 أسئلة اختبار في مادة الرياضيات',
    ],
    writing: [
      'ساعدني في كتابة مقدمة جذابة لمقال عن التقنية',
      'راجع هذا النص وحسّن أسلوبه: ...',
      'اكتب 5 عناوين مثيرة لمقال عن ريادة الأعمال',
    ],
    marketing: [
      'اكتب إعلاناً جذاباً لمنتج تقني جديد',
      'ما أفضل استراتيجيات التسويق لمنصة SaaS؟',
      'اكتب caption لمنشور إنستغرام عن منتجي',
    ],
  }

  const prompts = EXAMPLE_PROMPTS[assistantType] || EXAMPLE_PROMPTS.general

  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600/20 text-3xl">
        🤖
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{info.label}</h3>
      <p className="text-sm text-slate-400 mb-8 max-w-sm">{info.description}</p>

      <div className="w-full max-w-md space-y-2">
        <p className="text-xs text-slate-500 mb-3">جرّب هذه الأسئلة:</p>
        {prompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onPromptClick(prompt)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-right text-sm text-slate-300 hover:border-brand-500/50 hover:bg-slate-800 hover:text-white transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
