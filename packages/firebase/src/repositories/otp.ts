import { COLLECTIONS } from '@unbogi/contracts';
import * as admin from 'firebase-admin';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OtpData {
  code: string;
  attempts: number;
  expiresAt: admin.firestore.Timestamp;
  telegramId?: number | null;
  nickname: string;
}

// ─── Repository ───────────────────────────────────────────────────────────────

/** Data-access layer for the `system_otp` collection. Server-side only. */
export class OtpRepository {
  private get collection() {
    return admin.firestore().collection(COLLECTIONS.SYSTEM_OTP);
  }

  /** Returns OTP document data or `null` if not found. */
  async getOtp(email: string): Promise<OtpData | null> {
    const snap = await this.collection.doc(email).get();
    return snap.exists ? (snap.data() as OtpData) : null;
  }

  /**
   * Writes (or overwrites) an OTP record.
   * Called only AFTER the email has been successfully delivered (compensating write).
   */
  async setOtp(email: string, data: OtpData): Promise<void> {
    await this.collection.doc(email).set(data);
  }

  /** Atomically increments the failed attempts counter. */
  async incrementAttempts(email: string): Promise<void> {
    await this.collection.doc(email).update({
      attempts: admin.firestore.FieldValue.increment(1),
    });
  }

  /** Deletes the OTP record (after successful verification or max attempts exceeded). */
  async deleteOtp(email: string): Promise<void> {
    await this.collection.doc(email).delete();
  }
}
