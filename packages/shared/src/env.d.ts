/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly UNBOGI_FIREBASE_API_KEY: string;
  readonly UNBOGI_FIREBASE_AUTH_DOMAIN: string;
  readonly UNBOGI_FIREBASE_PROJECT_ID: string;
  readonly UNBOGI_FIREBASE_STORAGE_BUCKET: string;
  readonly UNBOGI_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly UNBOGI_FIREBASE_APP_ID: string;
  readonly UNBOGI_USE_FIREBASE_EMULATOR?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
