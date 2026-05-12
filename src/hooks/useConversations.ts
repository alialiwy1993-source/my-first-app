'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Conversation } from '@/types/database'

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Stable ref للـ supabase client
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const fetchConversations = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('is_archived', false)
        .order('updated_at', { ascending: false })
        .limit(50)

      if (fetchError) throw fetchError
      setConversations(data as Conversation[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في جلب المحادثات')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const deleteConversation = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id)

      if (!deleteError) {
        setConversations((prev) => prev.filter((c) => c.id !== id))
      }
      return !deleteError
    },
    [supabase]
  )

  const renameConversation = useCallback(
    async (id: string, title: string) => {
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ title })
        .eq('id', id)

      if (!updateError) {
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title } : c))
        )
      }
      return !updateError
    },
    [supabase]
  )

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
    deleteConversation,
    renameConversation,
  }
}
