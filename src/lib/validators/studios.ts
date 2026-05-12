import { z } from 'zod'

export const generateSchema = z.object({
  studioSlug: z.string().min(1),
  input: z.record(z.unknown()),
  model: z.string().optional(),
})

export const articleSchema = z.object({
  topic: z.string().min(5, 'الموضوع يجب أن يكون 5 أحرف على الأقل').max(500),
  type: z.enum(['general', 'seo', 'technical', 'marketing', 'educational', 'opinion']),
  tone: z.enum(['professional', 'casual', 'academic', 'persuasive', 'informative']),
  length: z.enum(['short', 'medium', 'long']),
  keywords: z.string().max(300).optional(),
  targetAudience: z.string().max(200).optional(),
})

export const translationSchema = z.object({
  text: z.string().min(1, 'النص مطلوب').max(5000, 'النص طويل جداً (الحد الأقصى 5000 حرف)'),
  sourceLanguage: z.string().min(1),
  targetLanguage: z.string().min(1),
  type: z.enum(['general', 'academic', 'marketing', 'technical', 'literary', 'official']),
  mode: z.enum(['translate', 'improve', 'rephrase', 'detect-errors']).optional(),
})

export type GenerateInput = z.infer<typeof generateSchema>
export type ArticleInput = z.infer<typeof articleSchema>
export type TranslationInput = z.infer<typeof translationSchema>
