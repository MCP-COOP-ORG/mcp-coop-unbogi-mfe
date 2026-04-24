import * as admin from 'firebase-admin';
import { getDownloadURL } from 'firebase-admin/storage';
import * as logger from 'firebase-functions/logger';

// ─── Storage ──────────────────────────────────────────────────────────────────

/**
 * Resolves a raw storage path to an absolute Firebase Storage download URL.
 * Returns the value as-is if it's already an absolute URL (starts with 'http').
 * Returns an empty string for null / non-string inputs.
 * Falls back to the original path if the download URL cannot be obtained.
 */
export async function resolveStorageUrl(path: unknown): Promise<string> {
  if (typeof path !== 'string' || !path) return '';
  if (path.startsWith('http')) return path;

  try {
    const bucket = admin.storage().bucket();
    return await getDownloadURL(bucket.file(path));
  } catch (err) {
    logger.error(`[StorageUtils] Failed to resolve URL for "${path}":`, err);
    return path;
  }
}

// ─── Timestamps ───────────────────────────────────────────────────────────────

type FirestoreTimestamp = admin.firestore.Timestamp | { toDate(): Date } | undefined | null;

/**
 * Converts a Firestore Timestamp (or any object with `.toDate()`) to an ISO-8601 string.
 * Returns `undefined` when the value is absent, making it safe for optional fields.
 */
export function mapTimestamp(ts: FirestoreTimestamp): string | undefined {
  return ts?.toDate?.()?.toISOString();
}
