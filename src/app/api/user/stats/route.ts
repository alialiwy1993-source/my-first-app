import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const [generationsRes, conversationsRes, tokensRes] = await Promise.all([
    supabase
      .from('studio_generations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('user_usage')
      .select('tokens_used')
      .eq('user_id', user.id),
  ])

  const totalTokens = (tokensRes.data ?? []).reduce((sum, row) => sum + (row.tokens_used ?? 0), 0)

  return NextResponse.json({
    totalGenerations: generationsRes.count ?? 0,
    totalConversations: conversationsRes.count ?? 0,
    totalTokensUsed: totalTokens,
  })
}
