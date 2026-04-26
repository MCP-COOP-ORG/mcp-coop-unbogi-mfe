import { type Translations, translations } from '@/lib/i18n';
import { tg } from '@/lib/telegram';

export function useT() {
  const langCode = tg.languageCode || (typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : 'en');
  const t: Translations = translations[langCode] ?? translations.en;
  return t;
}
