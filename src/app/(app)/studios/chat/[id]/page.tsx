'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import ChatWindow from '@/components/studios/chat/ChatWindow'
import ChatSidebar from '@/components/studios/chat/ChatSidebar'
import { useChat } from '@/hooks/useChat'
import { useConversations } from '@/hooks/useConversations'
import Spinner from '@/components/ui/Spinner'
import type { AssistantType } from '@/types/database'
import type { ChatMessage } from '@/types/chat'

export default function ChatConversationPage() {
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id as string

  const [assistantType, setAssistantType] = useState<AssistantType>('general')
  const [conversationTitle, setConversationTitle] = useState<string>('')
  const [initialLoading, setInitialLoading] = useState(true)

  const { conversations, deleteConversation, renameConversation, refetch } = useConversations()

  const { messages, isLoading, sendMessage, stopGeneration, clearMessages, setMessages } = useChat({
    conversationId,
    assistantType,
    onConversationCreated: (newId) => {
      refetch()
      router.replace(`/studios/chat/${newId}`, { scroll: false })
    },
  })

  // Load existing conversation messages
  useEffect(() => {
    if (!conversationId) { setInitialLoading(false); return }

    const loadConversation = async () => {
      try {
        const res = await fetch(`/api/conversations/${conversationId}`)
        if (!res.ok) { router.push('/studios/chat'); return }
        const { conversation } = await res.json()

        setConversationTitle(conversation.title)
        setAssistantType(conversation.assistant_type as AssistantType)

        if (conversation.messages?.length > 0) {
          const loaded: ChatMessage[] = conversation.messages.map((m: {
            id: string; role: string; content: string; created_at: string
          }) => ({
            id: m.id,
            role: m.role as ChatMessage['role'],
            content: m.content,
            createdAt: m.created_at,
          }))
          setMessages(loaded)
        }
      } catch {
        router.push('/studios/chat')
      } finally {
        setInitialLoading(false)
      }
    }

    loadConversation()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  const handleNew = useCallback(() => {
    clearMessages()
    router.push('/studios/chat')
  }, [clearMessages, router])

  if (initialLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex">
        <ChatSidebar
          conversations={conversations}
          activeId={conversationId}
          onDelete={async (id) => {
            const ok = await deleteConversation(id)
            if (ok && id === conversationId) router.push('/studios/chat')
            return ok
          }}
          onRename={async (id, title) => {
            const ok = await renameConversation(id, title)
            if (ok && id === conversationId) setConversationTitle(title)
            return ok
          }}
          onNew={handleNew}
        />
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSend={sendMessage}
          onStop={stopGeneration}
          assistantType={assistantType}
          onAssistantTypeChange={setAssistantType}
          conversationTitle={conversationTitle}
        />
      </div>
    </div>
  )
}
