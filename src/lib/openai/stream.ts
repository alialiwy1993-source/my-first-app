import { getOpenAIClient, DEFAULT_MODEL } from './client'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

// =====================================================
// Streaming helpers للـ SSE
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
        controller.enqueue(new TextEncoder().encode(`\n\n[خطأ: ${message}]`))
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
 * يولّد رداً كاملاً (غير streaming) مع حساب الـ tokens
 */
export async function generateCompletion(options: StreamOptions): Promise<{
  content: string
  tokensUsed: number
  model: string
}> {
  const { messages, model = DEFAULT_MODEL, temperature = 0.7, maxTokens } = options

  const openai = getOpenAIClient()

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
}
