const en = {
  auth: {
    subtitle: 'Gifts worth waiting for',
    emailPlaceholder: 'Email to receive code',
  },
} as const;

export type Translations = typeof en;
export const translations: Record<string, Translations> = { en };
