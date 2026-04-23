import { ERROR_CODES } from '@unbogi/contracts';
import { type FunctionsErrorCode, HttpsError } from 'firebase-functions/v2/https';

// ─── Type Guards ─────────────────────────────────────────────────────────────

/** Narrows an unknown value to a Firebase-style error shape `{ code, message }`. */
export const isFirebaseError = (error: unknown): error is { code: string; message: string } =>
  typeof error === 'object' && error !== null && 'code' in error && 'message' in error;

// ─── Domain Error ─────────────────────────────────────────────────────────────

/**
 * Typed domain error thrown by repositories and services.
 * Uses string codes that map 1-to-1 to Firebase Functions error codes,
 * replacing raw `throw new Error('NOT_FOUND')` magic strings.
 */
export class AppError extends Error {
  constructor(
    public readonly code: FunctionsErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// ─── Converters ───────────────────────────────────────────────────────────────

/**
 * Converts any caught error into an `HttpsError` safe to return from a Cloud Function.
 * - Re-throws existing `HttpsError` as-is.
 * - Maps `AppError` using its typed code.
 * - Falls back to `internal` for unknown errors.
 */
export function errorToHttpsError(error: unknown): HttpsError {
  if (error instanceof HttpsError) return error;

  if (error instanceof AppError) {
    return new HttpsError(error.code, error.message);
  }

  if (error instanceof Error) {
    return new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, error.message);
  }

  return new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, String(error));
}

