import type { StudioCategory } from './database'

// =====================================================
// Studio Types — أنواع الاستوديوهات
// =====================================================

export interface StudioConfig {
  slug: string
  nameAr: string
  nameEn: string
  descriptionAr: string
  category: StudioCategory
  icon: string
  color: string
  gradient: string
  href: string
  isActive: boolean
  isPremium: boolean
  sortOrder: number
  comingSoon?: boolean
}

export interface GenerateRequest {
  studioSlug: string
  input: Record<string, unknown>
  model?: string
}

export interface GenerateResponse {
  id: string
  output: string
  tokensUsed: number
  model: string
  durationMs: number
}

export type StudioSlug =
  | 'chat'
  | 'articles'
  | 'translation'
  | 'research'
  | 'social'
  | 'channel-analyzer'
  | 'thumbnails'
  | 'images'
  | 'audio'
  | 'video'
  | 'books-tools'
