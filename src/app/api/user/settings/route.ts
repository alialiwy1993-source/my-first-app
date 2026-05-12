import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const body = await request.json()
  const allowedFields = ['preferred_model', 'preferred_theme', 'preferred_language']
  const updates: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field]
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select('preferred_model, preferred_theme, preferred_language')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ settings: data })
}
