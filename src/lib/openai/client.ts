import OpenAI from 'openai'
import { isMockMode } from './mock'

// =====================================================
// OpenAI Client — singleton للاستخدام في Server فقط
// =====================================================

let openaiInstance: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (isMockMode()) {
    // Return a dummy client that won't be used (mock handles responses)
    return {} as OpenAI
  }

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
