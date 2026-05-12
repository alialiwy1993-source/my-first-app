import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOpenAIClient, DEFAULT_MODEL } from '@/lib/openai/client'
import { getChatSystemPrompt } from '@/lib/openai/prompts/chat'
import { sendMessageSchema } from '@/lib/validators/chat'
import { generateConversationTitle, truncate } from '@/lib/utils'
import type { AssistantType } from '@/types/database'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = sendMessageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة', details: parsed.error.errors }, { status: 400 })
    }

    const { conversationId, message, assistantType = 'general', model = DEFAULT_MODEL } = parsed.data

    // إنشاء محادثة جديدة إذا لم تكن موجودة
    let activeConversationId = conversationId

    if (!activeConversationId) {
      const title = generateConversationTitle(message)
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title,
          assistant_type: assistantType as AssistantType,
          model,
        })
        .select('id')
        .single()

      if (convError || !newConversation) {
        return NextResponse.json({ error: 'خطأ في إنشاء المحادثة' }, { status: 500 })
      }

      activeConversationId = newConversation.id
    }

    // جلب سجل الرسائل السابقة (آخر 20 رسالة)
    const { data: previousMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', activeConversationId)
      .order('created_at', { ascending: true })
      .limit(20)

    // حفظ رسالة المستخدم
    await supabase.from('messages').insert({
      conversation_id: activeConversationId,
      role: 'user',
      content: message,
    })

    // بناء messages array للـ OpenAI
    const systemPrompt = getChatSystemPrompt(assistantType as AssistantType)
    const chatMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...(previousMessages ?? []).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const openai = getOpenAIClient()
    const convIdForHeaders = activeConversationId
    const isFirstMessage = !conversationId

    // إنشاء ReadableStream يبث البيانات ويحفظها في نفس الوقت
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = ''
        try {
          const completion = await openai.chat.completions.create({
            model,
            messages: chatMessages,
            stream: true,
            temperature: 0.7,
          })

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content ?? ''
            if (content) {
              fullContent += content
              controller.enqueue(encoder.encode(content))
            }
            if (chunk.choices[0]?.finish_reason === 'stop') break
          }

          controller.close()

          // حفظ الرد في الخلفية بعد اكتمال الـ stream
          supabase.from('messages').insert({
            conversation_id: convIdForHeaders,
            role: 'assistant',
            content: fullContent,
            model,
          }).then(() => {
            if (isFirstMessage) {
              supabase
                .from('conversations')
                .update({ title: truncate(message, 50) })
                .eq('id', convIdForHeaders)
                .then(() => undefined)
            }
          })
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : 'خطأ في OpenAI'
          controller.enqueue(encoder.encode(`\n\n[خطأ: ${errMsg}]`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Conversation-Id': convIdForHeaders,
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    const message = error instanceof Error ? error.message : 'خطأ في الخادم'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
