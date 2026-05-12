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

  const { messages, isLoading, error, sendMessage, stopGeneration, clearMessages } = useChat({
    assistantType,
    onConversationCreated: (newId) => {
      refetch()
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
        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 border-b border-red-500/20 bg-red-500/5 px-4 py-2">
            <span className="text-sm text-red-400">❌ {error}</span>
            <button
              onClick={clearMessages}
              className="mr-auto text-xs text-red-400 hover:text-red-300 underline"
            >
              مسح
            </button>
          </div>
        )}
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
