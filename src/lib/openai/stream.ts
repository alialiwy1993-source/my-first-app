import { getOpenAIClient, DEFAULT_MODEL } from './client'
import { isMockMode, getMockResponse } from './mock'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

// =====================================================
// Streaming & Completion helpers — مع دعم Mock Mode
// =====================================================

export interface StreamOptions {
  messages: ChatCompletionMessageParam[]
  model?: string
  temperature?: number
  maxTokens?: number
}

/**
 * ينشئ ReadableStream لبث الردود من OpenAI
 */
export function createStreamResponse(options: StreamOptions): Response {
  const { messages, model = DEFAULT_MODEL, temperature = 0.7, maxTokens } = options

  // ── Mock Mode: no OpenAI call ──
  if (isMockMode()) {
    const lastMsg = messages[messages.length - 1]?.content ?? ''
    const mockContent = `هذا رد تجريبي (Demo Mode) 🎭\n\n${String(lastMsg).slice(0, 200)}\n\n*أضف OPENAI_API_KEY لتفعيل AI الحقيقي*`
    
    const stream = new ReadableStream({
      start(controller) {
        // Simulate streaming by sending chunks
        const words = mockContent.split(' ')
        let i = 0
        const interval = setInterval(() => {
          if (i < words.length) {
            controller.enqueue(new TextEncoder().encode(words[i] + ' '))
            i++
          } else {
            clearInterval(interval)
            controller.close()
          }
        }, 30) // 30ms per word
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }

  // ── Real OpenAI ──
  const openai = getOpenAIClient()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await openai.chat.completions.create({
          model,
          messages,
          stream: true,
          temperature,
          ...(maxTokens ? { max_tokens: maxTokens } : {}),
        })

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content ?? ''
          if (content) {
            controller.enqueue(new TextEncoder().encode(content))
          }

          if (chunk.choices[0]?.finish_reason === 'stop') {
            controller.close()
            break
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'خطأ في OpenAI'
        
        // Handle 429 quota exceeded
        if (message.includes('429') || message.includes('quota') || message.includes('exceeded')) {
          controller.enqueue(new TextEncoder().encode(
            '\n\n❌ **رصيد OpenAI API غير كافٍ.**\n\nللحل:\n1. فعّل Billing في [platform.openai.com](https://platform.openai.com/settings/organization/billing)\n2. أو غيّر `AI_PROVIDER=mock` لاستخدام Demo Mode'
          ))
        } else {
          controller.enqueue(new TextEncoder().encode(`\n\n[خطأ: ${message}]`))
        }
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

/**
 * يولّد رداً كاملاً (غير streaming) — مع Mock support
 */
export async function generateCompletion(options: StreamOptions): Promise<{
  content: string
  tokensUsed: number
  model: string
}> {
  const { messages, model = DEFAULT_MODEL, temperature = 0.7, maxTokens } = options

  // ── Mock Mode ──
  if (isMockMode()) {
    // Extract studio slug from system prompt or return generic
    const systemMsg = String(messages[0]?.content ?? '')
    const userMsg = String(messages[messages.length - 1]?.content ?? '')
    
    return {
      content: `# نتيجة تجريبية (Demo Mode) 🎭\n\n${userMsg.slice(0, 300)}\n\n---\n*أضف OPENAI_API_KEY وغيّر AI_PROVIDER=openai لتفعيل الذكاء الاصطناعي الحقيقي*`,
      tokensUsed: 0,
      model: 'mock-demo',
    }
  }

  // ── Real OpenAI ──
  const openai = getOpenAIClient()

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      stream: false,
      temperature,
      ...(maxTokens ? { max_tokens: maxTokens } : {}),
    })

    return {
      content: completion.choices[0]?.message?.content ?? '',
      tokensUsed: completion.usage?.total_tokens ?? 0,
      model: completion.model,
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'خطأ'
    
    // Handle 429 — return helpful message instead of throwing
    if (msg.includes('429') || msg.includes('quota') || msg.includes('exceeded')) {
      return {
        content: `❌ **رصيد OpenAI API غير كافٍ.**\n\nللحل:\n1. فعّل Billing في [platform.openai.com/settings/organization/billing](https://platform.openai.com/settings/organization/billing)\n2. أو غيّر \`AI_PROVIDER=mock\` في \`.env.local\` لاستخدام Demo Mode\n3. أعد تشغيل المشروع`,
        tokensUsed: 0,
        model: 'error-429',
      }
    }
    
    throw error
  }
}
