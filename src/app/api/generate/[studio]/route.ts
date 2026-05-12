import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCompletion } from '@/lib/openai/stream'
import { DEFAULT_MODEL } from '@/lib/openai/client'

// Milestone 1 prompts
import { buildArticlePrompt, ARTICLES_SYSTEM_PROMPT, type ArticleInput } from '@/lib/openai/prompts/articles'
import { buildTranslationPrompt, TRANSLATION_SYSTEM_PROMPT, type TranslationInput } from '@/lib/openai/prompts/translation'

// Milestone 2 prompts
import { buildResearchPrompt, RESEARCH_SYSTEM_PROMPT, type ResearchInput } from '@/lib/openai/prompts/research'
import { buildSocialPrompt, SOCIAL_SYSTEM_PROMPT, type SocialInput } from '@/lib/openai/prompts/social'
import { buildChannelAnalyzerPrompt, CHANNEL_ANALYZER_SYSTEM_PROMPT, type ChannelAnalyzerInput } from '@/lib/openai/prompts/channel-analyzer'
import { buildThumbnailPrompt, THUMBNAILS_SYSTEM_PROMPT, type ThumbnailInput } from '@/lib/openai/prompts/thumbnails'
import { buildBooksToolsPrompt, BOOKS_TOOLS_SYSTEM_PROMPT, type BooksToolsInput } from '@/lib/openai/prompts/books-tools'

export const runtime = 'nodejs'
export const maxDuration = 60

interface Params { params: Promise<{ studio: string }> }

// =====================================================
// Prompt Registry — موحّد لكل الاستوديوهات
// =====================================================
function buildPrompt(
  studio: string,
  input: Record<string, unknown>
): { system: string; user: string } | null {
  switch (studio) {
    // ── Milestone 1 ──────────────────────────────────
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

    // ── Milestone 2 ──────────────────────────────────
    case 'research':
      return {
        system: RESEARCH_SYSTEM_PROMPT,
        user: buildResearchPrompt(input as unknown as ResearchInput),
      }
    case 'social':
      return {
        system: SOCIAL_SYSTEM_PROMPT,
        user: buildSocialPrompt(input as unknown as SocialInput),
      }
    case 'channel-analyzer':
      return {
        system: CHANNEL_ANALYZER_SYSTEM_PROMPT,
        user: buildChannelAnalyzerPrompt(input as unknown as ChannelAnalyzerInput),
      }
    case 'thumbnails':
      return {
        system: THUMBNAILS_SYSTEM_PROMPT,
        user: buildThumbnailPrompt(input as unknown as ThumbnailInput),
      }
    case 'books-tools':
      return {
        system: BOOKS_TOOLS_SYSTEM_PROMPT,
        user: buildBooksToolsPrompt(input as unknown as BooksToolsInput),
      }

    default:
      return null
  }
}

// =====================================================
// Title extractor — عنوان ذكي لكل استوديو
// =====================================================
function extractTitle(studio: string, input: Record<string, unknown>): string {
  const get = (key: string): string =>
    input[key] ? String(input[key]).slice(0, 80) : ''

  switch (studio) {
    case 'articles':
      return get('topic') || 'مقال جديد'
    case 'translation':
      return get('text') ? get('text').slice(0, 60) + '...' : 'ترجمة جديدة'
    case 'research':
      return get('title') || get('field') || 'بحث أكاديمي جديد'
    case 'social':
      return get('topic') || 'محتوى سوشيال جديد'
    case 'channel-analyzer':
      return get('channelName') ? `تحليل: ${get('channelName')}` : 'تحليل قناة جديد'
    case 'thumbnails':
      return get('videoTitle') || 'صورة مصغرة جديدة'
    case 'books-tools':
      return get('bookTitle') || get('field') || 'اكتشاف جديد'
    default:
      return `توليد ${studio}`
  }
}

// =====================================================
// Output format per studio
// =====================================================
function getOutputFormat(studio: string): string {
  const plainText = ['translation', 'channel-analyzer']
  return plainText.includes(studio) ? 'text' : 'markdown'
}

// =====================================================
// Main handler
// =====================================================
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { studio } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { input, model = DEFAULT_MODEL } = body as {
      input: Record<string, unknown>
      model?: string
    }

    if (!input || typeof input !== 'object') {
      return NextResponse.json({ error: 'بيانات الإدخال مطلوبة' }, { status: 400 })
    }

    // Build prompt
    const promptData = buildPrompt(studio, input)
    if (!promptData) {
      return NextResponse.json(
        { error: `الاستوديو "${studio}" غير مدعوم بعد` },
        { status: 400 }
      )
    }

    const startTime = Date.now()

    // Call OpenAI
    const { content, tokensUsed, model: usedModel } = await generateCompletion({
      messages: [
        { role: 'system', content: promptData.system },
        { role: 'user', content: promptData.user },
      ],
      model,
      temperature: studio === 'translation' ? 0.3 : 0.8,
    })

    const durationMs = Date.now() - startTime

    // Save to DB
    const { data: generation, error: saveError } = await supabase
      .from('studio_generations')
      .insert({
        user_id: user.id,
        studio_slug: studio,
        prompt: promptData.user.slice(0, 500),
        input,
        output: content,
        output_format: getOutputFormat(studio),
        model: usedModel,
        tokens_used: tokensUsed,
        duration_ms: durationMs,
        status: 'completed',
        title: extractTitle(studio, input),
      })
      .select()
      .single()

    if (saveError) {
      console.error(`[generate/${studio}] DB save error:`, saveError.message)
    }

    // Log usage
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
    const studioId = (await params).studio
    console.error(`[generate/${studioId}] Error:`, error)
    const message = error instanceof Error ? error.message : 'خطأ في الخادم'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
