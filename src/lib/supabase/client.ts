import { createBrowserClient } from '@supabase/ssr'
import type { Profile, StudioGeneration, Conversation, Message } from '@/types/database'

// =====================================================
// Supabase Browser Client — للاستخدام في Client Components
// =====================================================

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Re-export types للاستخدام المريح
export type { Profile, StudioGeneration, Conversation, Message }
