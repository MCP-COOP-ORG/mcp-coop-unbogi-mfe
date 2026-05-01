/**
 * Production-safe logger with __DEV__ guard.
 * In release builds, only `error` logs are emitted.
 */
export const logger = {
  debug: (...args: unknown[]): void => {
    if (__DEV__) console.log('[DEBUG]', ...args);
  },
  info: (...args: unknown[]): void => {
    if (__DEV__) console.info('[INFO]', ...args);
  },
  warn: (...args: unknown[]): void => {
    if (__DEV__) console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]): void => {
    console.error('[ERROR]', ...args);
  },
} as const;
