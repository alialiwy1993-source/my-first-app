'use client'

import { useState, useCallback, useRef, type Dispatch, type SetStateAction } from 'react'
import type { ChatMessage } from '@/types/chat'
import type { AssistantType } from '@/types/database'
import { generateId } from '@/lib/utils'

interface UseChatOptions {
  conversationId?: string
  assistantType?: AssistantType
  model?: string
  onConversationCreated?: (id: string) => void
}

interface UseChatReturn {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  sendMessage: (content: string) => Promise<void>
  stopGeneration: () => void
  clearMessages: () => void
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { conversationId, assistantType = 'general', model, onConversationCreated } = options

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const currentConversationIdRef = useRef<string | undefined>(conversationId)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      setError(null)
      setIsLoading(true)

      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMessage])

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      abortControllerRef.current = new AbortController()

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: currentConversationIdRef.current,
            message: content,
            assistantType,
            model,
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error ?? 'خطأ في الاتصال بالخادم')
        }

        // استقبال conversation ID من الـ headers
        const newConversationId = response.headers.get('X-Conversation-Id')
        if (newConversationId && !currentConversationIdRef.current) {
          currentConversationIdRef.current = newConversationId
          onConversationCreated?.(newConversationId)
        }

        // قراءة الـ stream
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) throw new Error('لا يوجد stream')

        let fullContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          fullContent += chunk

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: fullContent }
                : msg
            )
          )
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // المستخدم أوقف التوليد
          return
        }

        const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
        setError(errorMessage)

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, content: `خطأ: ${errorMessage}` }
              : msg
          )
        )
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [isLoading, assistantType, model, onConversationCreated]
  )

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort()
    setIsLoading(false)
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
    currentConversationIdRef.current = undefined
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    stopGeneration,
    clearMessages,
    setMessages,
  }
}
