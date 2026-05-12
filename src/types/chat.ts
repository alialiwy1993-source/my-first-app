import type { MessageRole, AssistantType } from './database'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  createdAt: string
}

export interface SendMessageRequest {
  conversationId?: string
  message: string
  assistantType?: AssistantType
  model?: string
}

export interface ConversationWithMessages {
  id: string
  title: string
  assistantType: AssistantType
  model: string
  isPinned: boolean
  isArchived: boolean
  createdAt: string
  updatedAt: string
  messages?: ChatMessage[]
}

export const ASSISTANT_TYPES: Record<AssistantType, { label: string; description: string; systemPrompt: string }> = {
  general: {
    label: 'مساعد عام',
    description: 'محادثة عامة وإجابة على الأسئلة',
    systemPrompt: 'أنت مساعد ذكاء اصطناعي مفيد وودود. تتحدث العربية بطلاقة وتجيب بشكل واضح ومنظم.',
  },
  coder: {
    label: 'مساعد برمجة',
    description: 'مساعدة في الكود والبرمجة',
    systemPrompt: 'أنت خبير برمجة متخصص. تساعد في كتابة الكود وشرح الأخطاء وتقديم أفضل الممارسات. تستخدم code blocks دائماً.',
  },
  business: {
    label: 'مساعد أعمال',
    description: 'خطط أعمال وتسويق واستراتيجية',
    systemPrompt: 'أنت مستشار أعمال خبير. تساعد في خطط الأعمال والتسويق والاستراتيجية والتحليل التجاري.',
  },
  study: {
    label: 'مساعد دراسة',
    description: 'شرح الدروس والمفاهيم الأكاديمية',
    systemPrompt: 'أنت معلم صبور ومتخصص. تشرح المفاهيم بأسلوب بسيط وتقدم أمثلة توضيحية وأسئلة للتدريب.',
  },
  writing: {
    label: 'مساعد كتابة',
    description: 'كتابة وتحرير المحتوى',
    systemPrompt: 'أنت كاتب محترف. تساعد في كتابة وتحرير وتحسين المحتوى العربي بأساليب متنوعة.',
  },
  marketing: {
    label: 'مساعد تسويق',
    description: 'محتوى تسويقي وإعلانات',
    systemPrompt: 'أنت خبير تسويق رقمي. تساعد في إنشاء المحتوى التسويقي والإعلانات وتحليل الجمهور المستهدف.',
  },
}
