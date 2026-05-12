export const AI_MODELS = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'سريع واقتصادي — مناسب للاستخدام اليومي',
    isPremium: false,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'الأكثر قدرة — مثالي للمهام المعقدة',
    isPremium: true,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'متوازن بين السرعة والجودة',
    isPremium: true,
  },
] as const

export type ModelId = (typeof AI_MODELS)[number]['id']

export const DEFAULT_MODEL: ModelId = 'gpt-4o-mini'

export const IMAGE_MODELS = [
  { id: 'dall-e-3', name: 'DALL·E 3', isPremium: false },
  { id: 'dall-e-2', name: 'DALL·E 2', isPremium: false },
] as const

export const TTS_MODELS = [
  { id: 'tts-1', name: 'TTS Standard', isPremium: false },
  { id: 'tts-1-hd', name: 'TTS HD', isPremium: true },
] as const

export const TTS_VOICES = [
  { id: 'alloy', name: 'Alloy', gender: 'محايد' },
  { id: 'echo', name: 'Echo', gender: 'ذكر' },
  { id: 'fable', name: 'Fable', gender: 'ذكر' },
  { id: 'onyx', name: 'Onyx', gender: 'ذكر' },
  { id: 'nova', name: 'Nova', gender: 'أنثى' },
  { id: 'shimmer', name: 'Shimmer', gender: 'أنثى' },
] as const
