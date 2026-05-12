export const LIMITS = {
  FREE_USAGE_LIMIT: parseInt(process.env.FREE_USAGE_LIMIT ?? '100'),
  MAX_PDF_SIZE_MB: parseInt(process.env.MAX_PDF_SIZE_MB ?? '10'),
  MAX_PDF_SIZE_BYTES: parseInt(process.env.MAX_PDF_SIZE_MB ?? '10') * 1024 * 1024,
  MAX_MESSAGE_LENGTH: 10000,
  MAX_PROMPT_LENGTH: 5000,
  CHAT_HISTORY_LIMIT: 50, // عدد الرسائل المحفوظة في السياق
  CONVERSATIONS_PER_PAGE: 20,
  GENERATIONS_PER_PAGE: 20,
} as const
