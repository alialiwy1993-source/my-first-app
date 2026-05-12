import OpenAI from 'openai'

// =====================================================
// OpenAI Client — singleton للاستخدام في Server فقط
// =====================================================

let openaiInstance: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY غير مُضبوط في environment variables')
    }
    openaiInstance = new OpenAI({ apiKey })
  }
  return openaiInstance
}

export const DEFAULT_MODEL = process.env.OPENAI_DEFAULT_MODEL ?? 'gpt-4o-mini'

export const SYSTEM_TEMPERATURE = 0.7
export const CREATIVE_TEMPERATURE = 0.9
export const PRECISE_TEMPERATURE = 0.3
