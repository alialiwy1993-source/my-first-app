import { createClient } from '@supabase/supabase-js'

// =====================================================
// Supabase Admin Client — يستخدم Service Role Key
// تحذير: لا يُستخدم هذا الـ client في Client Components أبداً
// =====================================================

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase admin credentials')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
