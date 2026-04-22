const en = {
  auth: {
    subtitle: 'Gifts worth waiting for',
    emailPlaceholder: 'Email to receive code',
    codeSent: 'Code sent to',
    otpExpired: 'Code expired. Go back and request a new one.',
    sending: 'Sending…',
    verifying: 'Verifying…',
    errorInvalidCode: 'Invalid code. Check and try again.',
    errorTooManyAttempts: 'Too many attempts. Request a new code.',
    errorExpired: 'Code expired. Request a new one.',
    errorGeneric: 'Something went wrong. Try again.',
  },
} as const;

export type Translations = typeof en;
export const translations: Record<string, Translations> = { en };
