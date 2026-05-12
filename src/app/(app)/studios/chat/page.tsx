'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ChatWindow from '@/components/studios/chat/ChatWindow'
import ChatSidebar from '@/components/studios/chat/ChatSidebar'
import { useChat } from '@/hooks/useChat'
import { useConversations } from '@/hooks/useConversations'
import type { AssistantType } from '@/types/database'

export default function ChatStudioPage() {
  const router = useRouter()
  const [assistantType, setAssistantType] = useState<AssistantType>('general')

  const { conversations, loading: convsLoading, deleteConversation, renameConversation, refetch } = useConversations()

  const { messages, isLoading, sendMessage, stopGeneration, clearMessages } = useChat({
    assistantType,
    onConversationCreated: (newId) => {
      refetch()
      // Update URL without full navigation
      router.replace(`/studios/chat/${newId}`, { scroll: false })
    },
  })

  const handleNew = useCallback(() => {
    clearMessages()
    router.push('/studios/chat')
  }, [clearMessages, router])

  return (
    <div className="flex h-[calc(100vh-4rem)] -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex">
        <ChatSidebar
          conversations={conversations}
          activeId={undefined}
          onDelete={deleteConversation}
          onRename={renameConversation}
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
        />
      </div>
    </div>
  )
}
