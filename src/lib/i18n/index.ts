export { ar } from './ar'

// Helper بسيط للوصول للنصوص
// في المستقبل يمكن توسيعه لدعم i18n كامل
export const t = (key: string, translations = ar): string => {
  const keys = key.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translations
  for (const k of keys) {
    value = value?.[k]
  }
  return typeof value === 'string' ? value : key
}

import { ar } from './ar'
