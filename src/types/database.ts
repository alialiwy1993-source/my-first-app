// =====================================================
// Database Types — مُولَّدة يدوياً من schema Supabase
// =====================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'user' | 'admin'
export type UserPlan = 'free' | 'pro' | 'enterprise'
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'trialing'
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type MessageRole = 'user' | 'assistant' | 'system'
export type AssistantType = 'general' | 'coder' | 'business' | 'study' | 'writing' | 'marketing'
export type StudioCategory = 'text' | 'image' | 'audio' | 'video' | 'research'
export type OutputFormat = 'text' | 'markdown' | 'json' | 'html'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  plan: UserPlan
  usage_limit: number
  usage_count: number
  subscription_status: SubscriptionStatus
  subscription_end: string | null
  preferred_model: string
  preferred_theme: 'dark' | 'light'
  preferred_language: string
  created_at: string
  updated_at: string
}

export interface Studio {
  id: string
  slug: string
  name_ar: string
  name_en: string | null
  description_ar: string | null
  category: StudioCategory
  icon: string | null
  color: string | null
  is_active: boolean
  is_premium: boolean
  sort_order: number
  config: Json | null
  created_at: string
}

export interface StudioGeneration {
  id: string
  user_id: string
  studio_slug: string
  prompt: string | null
  input: Json | null
  output: string | null
  output_format: OutputFormat
  image_url: string | null
  audio_url: string | null
  video_url: string | null
  file_url: string | null
  model: string | null
  tokens_used: number
  cost_cents: number
  duration_ms: number | null
  metadata: Json | null
  status: GenerationStatus
  error_message: string | null
  is_favorite: boolean
  is_archived: boolean
  title: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  assistant_type: AssistantType
  model: string
  is_pinned: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  tokens_used: number
  model: string | null
  created_at: string
}

export interface UserUsage {
  id: string
  user_id: string
  studio_slug: string | null
  action: string
  tokens_used: number
  cost_cents: number
  metadata: Json | null
  created_at: string
}

export interface AiTool {
  id: string
  name: string
  url: string
  description_ar: string | null
  category: string
  tags: string[] | null
  is_free: boolean
  logo_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}


export interface GeneratedAudio {
  id: string
  user_id: string
  generation_id: string | null
  text_input: string
  voice: string | null
  language: string
  model: string | null
  audio_url: string
  storage_path: string | null
  duration_seconds: number | null
  speed?: number | null
  file_size?: number | null
  status?: string | null
  metadata?: Json | null
  created_at: string
}

export interface GeneratedVideo {
  id: string
  user_id: string
  generation_id: string | null
  prompt: string
  platform?: string | null
  video_type?: string | null
  video_url: string | null
  storage_path: string | null
  provider: string | null
  status: string
  duration_seconds: number | null
  script?: string | null
  scenes?: Json | null
  metadata: Json | null
  created_at: string
}
  id: string
  user_id: string
  generation_id: string | null
  prompt: string
  negative_prompt: string | null
  style: string | null
  size: string | null
  model: string | null
  image_url: string
  storage_path: string | null
  thumbnail_url: string | null
  is_favorite: boolean
  quality?: string | null
  metadata?: Json | null
  created_at: string
}
