import { translations, type Translations } from '@/lib/i18n';

const lang = 'en';

export function useT() {
  const t: Translations = translations[lang] ?? translations.en;
  return t;
}
