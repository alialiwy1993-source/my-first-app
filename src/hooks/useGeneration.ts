'use client'

import { useState, useCallback } from 'react'
import type { StudioGeneration } from '@/types/database'

interface UseGenerationOptions {
  studioSlug: string
  model?: string
}

interface UseGenerationReturn {
  result: string
  generation: StudioGeneration | null
  isLoading: boolean
  error: string | null
  generate: (input: Record<string, unknown>) => Promise<void>
  reset: () => void
}

export function useGeneration({ studioSlug, model }: UseGenerationOptions): UseGenerationReturn {
  const [result, setResult] = useState('')
  const [generation, setGeneration] = useState<StudioGeneration | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(
    async (input: Record<string, unknown>) => {
      setIsLoading(true)
      setError(null)
      setResult('')
      setGeneration(null)

      try {
        const response = await fetch(`/api/generate/${studioSlug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input, model }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error ?? 'خطأ في الاتصال بالخادم')
        }

        const data = await response.json()
        setResult(data.output)
        setGeneration(data.generation ?? null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [studioSlug, model]
  )

  const reset = useCallback(() => {
    setResult('')
    setGeneration(null)
    setError(null)
  }, [])

  return { result, generation, isLoading, error, generate, reset }
}
