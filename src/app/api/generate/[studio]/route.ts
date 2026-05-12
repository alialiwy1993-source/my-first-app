import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCompletion } from '@/lib/openai/stream'
import { DEFAULT_MODEL } from '@/lib/openai/client'
import { buildArticlePrompt, ARTICLES_SYSTEM_PROMPT } from '@/lib/openai/prompts/articles'
import { buildTranslationPrompt, TRANSLATION_SYSTEM_PROMPT } from '@/lib/openai/prompts/translation'
import type { ArticleInput } from '@/lib/openai/prompts/articles'
import type { TranslationInput } from '@/lib/openai/prompts/translation'

export const runtime = 'nodejs'
export const maxDuration = 60

interface Params { params: Promise<{ studio: string }> }

// بناء الـ prompt حسب الاستوديو
function buildPrompt(studio: string, input: Record<string, unknown>): { system: string; user: string } | null {
  switch (studio) {
    case 'articles':
      return {
        system: ARTICLES_SYSTEM_PROMPT,
        user: buildArticlePrompt(input as unknown as ArticleInput),
      }
    case 'translation':
      return {
        system: TRANSLATION_SYSTEM_PROMPT,
        user: buildTranslationPrompt(input as unknown as TranslationInput),
      }
    default:
      return null
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { studio } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const body = await request.json()
    const { input, model = DEFAULT_MODEL } = body

    // بناء الـ prompt
    const promptData = buildPrompt(studio, input ?? {})
    if (!promptData) {
      return NextResponse.json({ error: `الاستوديو "${studio}" غير مدعوم بعد` }, { status: 400 })
    }

    const startTime = Date.now()

    // استدعاء OpenAI
    const { content, tokensUsed, model: usedModel } = await generateCompletion({
      messages: [
        { role: 'system', content: promptData.system },
        { role: 'user', content: promptData.user },
      ],
      model,
      temperature: 0.8,
    })

    const durationMs = Date.now() - startTime

    // حفظ التوليد في DB
    const titleField = studio === 'articles' ? 'topic' : studio === 'translation' ? 'text' : 'topic'
    const rawTitle = (input as Record<string, unknown>)?.[titleField]
    const generationTitle = rawTitle
      ? String(rawTitle).slice(0, 80)
      : `توليد ${studio}`

    const { data: generation, error: saveError } = await supabase
      .from('studio_generations')
      .insert({
        user_id: user.id,
        studio_slug: studio,
        prompt: promptData.user.slice(0, 500),
        input,
        output: content,
        output_format: studio === 'translation' ? 'text' : 'markdown',
        model: usedModel,
        tokens_used: tokensUsed,
        duration_ms: durationMs,
        status: 'completed',
        title: generationTitle,
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving generation:', saveError)
    }

    // تسجيل الاستخدام
    await supabase.from('user_usage').insert({
      user_id: user.id,
      studio_slug: studio,
      action: 'generate',
      tokens_used: tokensUsed,
    })

    return NextResponse.json({
      output: content,
      tokensUsed,
      model: usedModel,
      durationMs,
      generation: generation ?? null,
    })
  } catch (error) {
    console.error(`Generate API error [${(await params).studio}]:`, error)
    const message = error instanceof Error ? error.message : 'خطأ في الخادم'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
