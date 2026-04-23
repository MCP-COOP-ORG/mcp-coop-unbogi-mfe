import * as admin from 'firebase-admin';
import { getDownloadURL } from 'firebase-admin/storage';
import * as logger from 'firebase-functions/logger';

/**
 * Resolves a raw file path from Firestore to an absolute Firebase Storage download URL.
 * If the path is already an absolute URL (e.g., starts with 'http'), it returns it as is.
 */
export async function resolveStorageUrl(path: unknown): Promise<string> {
  if (typeof path !== 'string' || !path) {
    return '';
  }

  if (path.startsWith('http')) {
    return path;
  }

  try {
    const bucket = admin.storage().bucket();
    return await getDownloadURL(bucket.file(path));
  } catch (err) {
    logger.error(`[StorageUtils] Failed to resolve URL for ${path}:`, err);
    return path;
  }
}
