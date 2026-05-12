'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn, formatRelativeTime, truncate } from '@/lib/utils'
import type { Conversation } from '@/types/database'

interface ChatSidebarProps {
  conversations: Conversation[]
  activeId?: string
  onDelete: (id: string) => Promise<boolean>
  onRename: (id: string, title: string) => Promise<boolean>
  onNew: () => void
}

export default function ChatSidebar({
  conversations,
  activeId,
  onDelete,
  onRename,
  onNew,
}: ChatSidebarProps) {
  const pathname = usePathname()
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  const handleRenameStart = (conv: Conversation) => {
    setRenamingId(conv.id)
    setRenameValue(conv.title)
    setMenuOpenId(null)
  }

  const handleRenameSubmit = async (id: string) => {
    if (renameValue.trim()) {
      await onRename(id, renameValue.trim())
    }
    setRenamingId(null)
  }

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المحادثة؟')) {
      await onDelete(id)
    }
    setMenuOpenId(null)
  }

  // تجميع المحادثات حسب التاريخ
  const now = new Date()
  const today = conversations.filter(c => {
    const d = new Date(c.updated_at)
    return d.toDateString() === now.toDateString()
  })
  const yesterday = conversations.filter(c => {
    const d = new Date(c.updated_at)
    const yest = new Date(now); yest.setDate(now.getDate() - 1)
    return d.toDateString() === yest.toDateString()
  })
  const older = conversations.filter(c => {
    const d = new Date(c.updated_at)
    const yest = new Date(now); yest.setDate(now.getDate() - 1)
    return d < yest
  })

  const Section = ({ title, items }: { title: string; items: Conversation[] }) => {
    if (!items.length) return null
    return (
      <div className="mb-4">
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">{title}</p>
        {items.map(conv => (
          <ConvItem key={conv.id} conv={conv} />
        ))}
      </div>
    )
  }

  const ConvItem = ({ conv }: { conv: Conversation }) => {
    const isActive = conv.id === activeId
    return (
      <div
        className={cn(
          'group relative flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition-colors',
          isActive ? 'bg-brand-600/15 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        )}
        onClick={() => {
          if (renamingId !== conv.id && !menuOpenId) {
            window.location.href = `/studios/chat/${conv.id}`
          }
        }}
      >
        {/* Icon */}
        <span className="text-base flex-shrink-0">
          {conv.is_pinned ? '📌' : '💬'}
        </span>

        {/* Title / Rename input */}
        {renamingId === conv.id ? (
          <input
            autoFocus
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onBlur={() => handleRenameSubmit(conv.id)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRenameSubmit(conv.id)
              if (e.key === 'Escape') setRenamingId(null)
            }}
            onClick={e => e.stopPropagation()}
            className="flex-1 min-w-0 rounded bg-slate-700 px-2 py-0.5 text-xs text-white outline-none border border-brand-500/50"
          />
        ) : (
          <span className="flex-1 min-w-0 truncate text-xs">
            {truncate(conv.title, 35)}
          </span>
        )}

        {/* Menu button */}
        {renamingId !== conv.id && (
          <button
            onClick={e => {
              e.stopPropagation()
              setMenuOpenId(menuOpenId === conv.id ? null : conv.id)
            }}
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 rounded p-0.5 text-slate-500 hover:text-white transition-all"
          >
            ⋮
          </button>
        )}

        {/* Dropdown menu */}
        {menuOpenId === conv.id && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
            <div className="absolute left-0 top-full z-20 mt-1 w-36 rounded-lg border border-slate-700 bg-slate-800 shadow-xl text-xs overflow-hidden">
              <button
                onClick={e => { e.stopPropagation(); handleRenameStart(conv) }}
                className="flex w-full items-center gap-2 px-3 py-2 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <span>✏️</span> إعادة تسمية
              </button>
              <button
                onClick={e => { e.stopPropagation(); handleDelete(conv.id) }}
                className="flex w-full items-center gap-2 px-3 py-2 text-red-400 hover:bg-slate-700 transition-colors"
              >
                <span>🗑️</span> حذف
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col border-l border-slate-800 bg-slate-900/50 w-64 flex-shrink-0">
      {/* New chat button */}
      <div className="p-3 border-b border-slate-800">
        <button
          onClick={onNew}
          className="btn-primary w-full py-2 text-sm justify-center"
        >
          <span>✏️</span>
          محادثة جديدة
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-3xl mb-2">💬</span>
            <p className="text-xs text-slate-500">لا توجد محادثات بعد</p>
          </div>
        ) : (
          <>
            <Section title="اليوم" items={today} />
            <Section title="أمس" items={yesterday} />
            <Section title="سابقاً" items={older} />
          </>
        )}
      </div>
    </div>
  )
}
