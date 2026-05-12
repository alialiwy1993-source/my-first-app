import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Params { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { data: conversation, error } = await supabase
    .from('conversations')
    .select('*, messages(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .order('created_at', { referencedTable: 'messages', ascending: true })
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ conversation })
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const body = await request.json()
  const allowedFields = ['title', 'is_pinned', 'is_archived', 'assistant_type']
  const updates: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field]
  }

  const { data, error } = await supabase
    .from('conversations')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ conversation: data })
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
