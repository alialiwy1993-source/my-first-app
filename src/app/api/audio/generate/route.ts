import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOpenAIClient } from '@/lib/openai/client'

export const runtime = 'nodejs'
export const maxDuration = 60

// =====================================================
// Available voices & models
// =====================================================
const VALID_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const
type TtsVoice = (typeof VALID_VOICES)[number]

const VALID_MODELS = ['tts-1', 'tts-1-hd'] as const

function validateVoice(v: string): TtsVoice {
  return VALID_VOICES.includes(v as TtsVoice) ? (v as TtsVoice) : 'alloy'
}

function validateSpeed(s: number): number {
  return Math.min(Math.max(s, 0.25), 4.0)
}

// =====================================================
// POST /api/audio/generate
// =====================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const body = await request.json()
    const {
      text,
      voice = 'alloy',
      speed = 1.0,
      language = 'ar',
      model,
    } = body as {
      text: string
      voice?: string
      speed?: number
      language?: string
      model?: string
    }

    if (!text || typeof text !== 'string' || text.trim().length < 3) {
      return NextResponse.json({ error: 'يرجى إدخال نص للتحويل إلى صوت' }, { status: 400 })
    }
    if (text.length > 4096) {
      return NextResponse.json({ error: 'النص طويل جداً (الحد الأقصى 4096 حرف)' }, { status: 400 })
    }

    const validatedVoice = validateVoice(voice)
    const validatedSpeed = validateSpeed(Number(speed) || 1.0)
    const ttsModel = (model && VALID_MODELS.includes(model as 'tts-1' | 'tts-1-hd'))
      ? (model as 'tts-1' | 'tts-1-hd')
      : ((process.env.OPENAI_TTS_MODEL ?? 'tts-1') as 'tts-1' | 'tts-1-hd')

    const openai = getOpenAIClient()
    const startTime = Date.now()

    // Call OpenAI TTS API
    const ttsResponse = await openai.audio.speech.create({
      model: ttsModel,
      voice: validatedVoice,
      input: text.trim(),
      speed: validatedSpeed,
      response_format: 'mp3',
    })

    const durationMs = Date.now() - startTime

    // Get audio buffer
    const arrayBuffer = await ttsResponse.arrayBuffer()
    const audioBuffer = Buffer.from(arrayBuffer)
    const fileSizeBytes = audioBuffer.length

    // ── Try to upload to Supabase Storage ──────────
    let audioUrl: string | null = null
    let storagePath: string | null = null

    try {
      const fileName = `${user.id}/${Date.now()}-audio.mp3`
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('generated-audio')
        .upload(fileName, audioBuffer, {
          contentType: 'audio/mpeg',
          upsert: false,
        })

      if (!uploadError && uploadData) {
        storagePath = uploadData.path
        // Get signed URL (valid 1 hour)
        const { data: signedUrl } = await supabase
          .storage
          .from('generated-audio')
          .createSignedUrl(storagePath, 3600)
        audioUrl = signedUrl?.signedUrl ?? null
      }
    } catch (storageErr) {
      console.warn('[audio/generate] Storage upload failed:', storageErr)
    }

    // ── Fallback: base64 data URL ──────────────────
    // If storage unavailable, send as base64 (client plays it directly)
    let audioBase64: string | null = null
    if (!audioUrl) {
      audioBase64 = audioBuffer.toString('base64')
      audioUrl = `data:audio/mpeg;base64,${audioBase64}`
    }

    // ── Save to generated_audio ─────────────────────
    const { data: savedAudio, error: saveError } = await supabase
      .from('generated_audio')
      .insert({
        user_id: user.id,
        text_input: text.trim(),
        voice: validatedVoice,
        language,
        model: ttsModel,
        audio_url: storagePath ? storagePath : 'base64', // store path, not raw base64
        storage_path: storagePath,
        speed: validatedSpeed,
        file_size: fileSizeBytes,
        status: 'completed',
        metadata: {
          model: ttsModel,
          voice: validatedVoice,
          speed: validatedSpeed,
          duration_ms: durationMs,
          file_size_bytes: fileSizeBytes,
          storage_used: !!storagePath,
        },
      })
      .select()
      .single()

    if (saveError) {
      console.error('[audio/generate] DB save error:', saveError.message)
    }

    // ── Save to studio_generations ─────────────────
    await supabase.from('studio_generations').insert({
      user_id: user.id,
      studio_slug: 'audio',
      prompt: text.trim().slice(0, 500),
      input: { text: text.trim(), voice: validatedVoice, speed: validatedSpeed, language },
      output: text.trim().slice(0, 300),
      output_format: 'text',
      audio_url: storagePath ?? 'base64',
      model: ttsModel,
      tokens_used: 0,
      duration_ms: durationMs,
      status: 'completed',
      title: text.trim().slice(0, 80),
    })

    // ── Log usage ───────────────────────────────────
    await supabase.from('user_usage').insert({
      user_id: user.id,
      studio_slug: 'audio',
      action: 'generate_audio',
      tokens_used: 0,
    })

    return NextResponse.json({
      audioUrl,         // data URL or signed URL
      storagePath,      // null if no storage
      voice: validatedVoice,
      speed: validatedSpeed,
      model: ttsModel,
      durationMs,
      fileSizeBytes,
      storageUsed: !!storagePath,
      id: savedAudio?.id ?? null,
    })
  } catch (error) {
    console.error('[audio/generate] Error:', error)
    const message = error instanceof Error ? error.message : 'خطأ في الخادم'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET /api/audio/generate — list user's audio files
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const { data, error } = await supabase
      .from('generated_audio')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ audios: data ?? [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطأ في الخادم'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
