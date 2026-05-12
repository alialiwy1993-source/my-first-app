import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOpenAIClient } from '@/lib/openai/client'
import { isMockMode } from '@/lib/openai/mock'

export const runtime = 'nodejs'
export const maxDuration = 60

// =====================================================
// Image style → enhanced prompt modifier
// =====================================================
const STYLE_MODIFIERS: Record<string, string> = {
  realistic:
    'photorealistic, ultra-detailed, 8k resolution, natural lighting, DSLR quality',
  cinematic:
    'cinematic photography, dramatic lighting, movie still, anamorphic lens, depth of field, film grain',
  cartoon:
    'cartoon style, vibrant colors, clean lines, flat design, digital illustration',
  anime:
    'anime style, manga illustration, Studio Ghibli inspired, detailed characters, beautiful scenery',
  '3d':
    '3D render, CGI, octane render, ray tracing, subsurface scattering, hyperrealistic 3D',
  advertising:
    'professional advertising photography, product shot, commercial quality, clean background, studio lighting',
  youtube_thumbnail:
    'YouTube thumbnail style, bold text space, high contrast, eye-catching, click-bait worthy composition, bright colors',
  social_media:
    'social media post design, clean aesthetic, modern design, Instagram worthy, visually appealing composition',
}

// =====================================================
// Size mapping
// =====================================================
const VALID_SIZES = ['1024x1024', '1792x1024', '1024x1792'] as const
type ValidSize = (typeof VALID_SIZES)[number]

function validateSize(size: string): ValidSize {
  if (VALID_SIZES.includes(size as ValidSize)) return size as ValidSize
  return '1024x1024'
}

// =====================================================
// Build enhanced prompt
// =====================================================
function buildEnhancedPrompt(prompt: string, style: string): string {
  const modifier = STYLE_MODIFIERS[style] ?? ''
  const base = prompt.trim()
  return modifier ? `${base}, ${modifier}` : base
}

// =====================================================
// POST /api/images/generate
// =====================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const {
      prompt,
      style = 'realistic',
      size = '1024x1024',
      quality = 'standard',
    } = body as {
      prompt: string
      style?: string
      size?: string
      quality?: 'standard' | 'hd'
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: 'يرجى إدخال وصف واضح للصورة (3 أحرف على الأقل)' },
        { status: 400 }
      )
    }

    const validatedSize = validateSize(size)
    const enhancedPrompt = buildEnhancedPrompt(prompt, style)
    const imageModel = process.env.OPENAI_IMAGE_MODEL ?? 'dall-e-3'

    // ── Mock Mode: return placeholder ──
    if (isMockMode()) {
      const mockImageUrl = `https://placehold.co/${validatedSize.replace('x', 'x')}/1e293b/6366f1?text=Demo+Image`

      await supabase.from('generated_images').insert({
        user_id: user.id,
        prompt: prompt.trim(),
        style,
        size: validatedSize,
        model: 'mock-demo',
        image_url: mockImageUrl,
        is_favorite: false,
        metadata: { mock: true, enhanced_prompt: enhancedPrompt },
      })

      await supabase.from('studio_generations').insert({
        user_id: user.id,
        studio_slug: 'images',
        prompt: prompt.trim(),
        input: { prompt, style, size, quality },
        output: `![Demo Image](${mockImageUrl})`,
        output_format: 'markdown',
        image_url: mockImageUrl,
        model: 'mock-demo',
        tokens_used: 0,
        duration_ms: 0,
        status: 'completed',
        title: prompt.trim().slice(0, 80),
      })

      return NextResponse.json({
        imageUrl: mockImageUrl,
        revisedPrompt: `[Demo] ${enhancedPrompt}`,
        style,
        size: validatedSize,
        durationMs: 100,
        id: null,
        mockMode: true,
        mockMessage: 'Demo Mode — توليد الصور يحتاج مفتاح OpenAI API. أضف OPENAI_API_KEY وغيّر AI_PROVIDER=openai',
      })
    }

    const openai = getOpenAIClient()
    const startTime = Date.now()

    // Call DALL-E API
    const response = await openai.images.generate({
      model: imageModel,
      prompt: enhancedPrompt,
      n: 1,
      size: validatedSize,
      quality,
      response_format: 'url',
    })

    const durationMs = Date.now() - startTime
    const imageData = response.data[0]

    if (!imageData?.url) {
      return NextResponse.json({ error: 'فشل في توليد الصورة' }, { status: 500 })
    }

    const imageUrl = imageData.url
    const revisedPrompt = imageData.revised_prompt ?? enhancedPrompt

    // Save to generated_images table
    const { data: savedImage, error: saveError } = await supabase
      .from('generated_images')
      .insert({
        user_id: user.id,
        prompt: prompt.trim(),
        negative_prompt: null,
        style,
        size: validatedSize,
        model: imageModel,
        image_url: imageUrl,
        storage_path: null, // future: upload to Supabase Storage
        thumbnail_url: null,
        is_favorite: false,
        metadata: {
          revised_prompt: revisedPrompt,
          quality,
          duration_ms: durationMs,
          enhanced_prompt: enhancedPrompt,
        },
      })
      .select()
      .single()

    if (saveError) {
      console.error('[images/generate] DB save error:', saveError.message)
    }

    // Also save to studio_generations for unified history
    await supabase.from('studio_generations').insert({
      user_id: user.id,
      studio_slug: 'images',
      prompt: prompt.trim(),
      input: { prompt, style, size, quality },
      output: `![Generated Image](${imageUrl})`,
      output_format: 'markdown',
      image_url: imageUrl,
      model: imageModel,
      tokens_used: 0,
      duration_ms: durationMs,
      status: 'completed',
      title: prompt.trim().slice(0, 80),
      metadata: { revised_prompt: revisedPrompt, style, size },
    })

    // Log usage
    await supabase.from('user_usage').insert({
      user_id: user.id,
      studio_slug: 'images',
      action: 'generate_image',
      tokens_used: 0,
    })

    return NextResponse.json({
      imageUrl,
      revisedPrompt,
      style,
      size: validatedSize,
      durationMs,
      id: savedImage?.id ?? null,
    })
  } catch (error) {
    console.error('[images/generate] Error:', error)
    const message = error instanceof Error ? error.message : 'خطأ في الخادم'

    // Handle OpenAI content policy errors
    if (message.includes('safety') || message.includes('content_policy')) {
      return NextResponse.json(
        { error: 'الصورة المطلوبة تخالف سياسة المحتوى. حاول بوصف مختلف.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET /api/images/generate — list user images
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)
    const page = Math.max(parseInt(searchParams.get('page') ?? '1'), 1)
    const offset = (page - 1) * limit

    const { data, error, count } = await supabase
      .from('generated_images')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      images: data ?? [],
      total: count ?? 0,
      page,
      limit,
      hasMore: (count ?? 0) > offset + limit,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطأ في الخادم'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
