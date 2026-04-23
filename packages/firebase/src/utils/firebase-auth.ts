import { ERROR_CODES, ERROR_MESSAGES, FIREBASE_ERRORS } from '@unbogi/contracts';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { type FunctionsErrorCode, HttpsError } from 'firebase-functions/v2/https';
import { isFirebaseError } from './errors';

// ─── Firebase Auth Utilities ──────────────────────────────────────────────────

/**
 * Retrieves an existing Firebase Auth user by email, or creates one if not found.
 * Throws `HttpsError('internal')` on any unexpected error.
 *
 * Eliminates the duplicated get→catch→create pattern present in
 * `AuthService.verifyEmailOtp` and `InviteService.redeemEmailInvite`.
 */
export async function getOrCreateFirebaseUser(email: string): Promise<admin.auth.UserRecord> {
  try {
    return await admin.auth().getUserByEmail(email);
  } catch (err: unknown) {
    if (isFirebaseError(err) && err.code === FIREBASE_ERRORS.USER_NOT_FOUND) {
      try {
        return await admin.auth().createUser({ email });
      } catch (createErr) {
        logger.error('[getOrCreateFirebaseUser] Failed to create user:', createErr);
        throw new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, ERROR_MESSAGES.AUTH_SYSTEM_ERROR);
      }
    }

    logger.error('[getOrCreateFirebaseUser] Unexpected error:', err);
    throw new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, ERROR_MESSAGES.AUTH_SYSTEM_ERROR);
  }
}
