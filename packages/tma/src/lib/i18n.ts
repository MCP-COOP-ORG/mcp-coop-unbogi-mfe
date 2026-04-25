const en = {
  auth: {
    subtitle: 'Gifts worth waiting for',
    emailPlaceholder: 'receive_code@example.com',
    codePlaceholder: 'enter received code',
    codeSent: 'Code sent to',
    otpExpired: 'Code expired. Go back and request a new one.',
    sending: 'Sending…',
    verifying: 'Verifying…',
    invalidEmail: 'Invalid email',
    invalidCode: 'Need 6 digits',
    errorInvalidCode: 'Wrong code',
    errorTooManyAttempts: 'Too many attempts',
    errorExpired: 'Code expired',
    errorGeneric: 'Something went wrong',
  },
  send: {
    title: 'Send Gift',
    searchFriend: 'Choose a friend',
    selectHoliday: 'Choose a holiday',
    greetingPlaceholder: 'Write your greeting...',
    unpackDate: 'Unpack date',
    giftCode: 'Gift code',
    textCode: 'Text code',
    photoQr: 'Photo / QR',
    codePlaceholder: 'Example: BEAR-111',
    scanQr: 'Scan gift barcode or QR code',
    scanAgain: 'Scan again',
    cancel: 'Cancel',
    send: 'Send',
    sending: 'Sending...',
    errorSubmit: 'Failed to send gift. Try again.',
  },
  collection: {
    empty: 'Your collection is empty',
  },
  surprises: {
    empty: 'No surprises yet',
    fromSender: 'From: {{name}}',
    canBeUnpacked: 'Available to scratch: {{date}}',
  },
  giftBack: {
    activationCode: 'Activation Code',
    scanToActivate: 'Scan to activate',
    tapToCopy: 'Tap to copy',
    from: 'from',
    flipCard: 'Flip card',
  },
} as const;

export type Translations = typeof en;
export const translations: Record<string, Translations> = { en };
