import { z } from 'zod'

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1, 'الرسالة لا يمكن أن تكون فارغة').max(10000, 'الرسالة طويلة جداً'),
  assistantType: z
    .enum(['general', 'coder', 'business', 'study', 'writing', 'marketing'])
    .optional()
    .default('general'),
  model: z.string().optional(),
})

export const renameConversationSchema = z.object({
  title: z.string().min(1).max(100),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type RenameConversationInput = z.infer<typeof renameConversationSchema>
