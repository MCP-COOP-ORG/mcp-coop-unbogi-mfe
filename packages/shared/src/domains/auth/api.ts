import { signInWithCustomToken } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { CLOUD_FUNCTIONS } from '../../constants';
import { auth, functions } from '../../firebase';

export const authApi = {
  /**
   * Telegram bootstrapping:
   * - Validates initData on the backend (HMAC)
   * - If the user is registered (found by telegramId) → signInWithCustomToken, hasEmail: true
   * - If not → hasEmail: false, Firebase session is not created
   */
  async authenticateTelegram(initData: string): Promise<{ hasEmail: boolean }> {
    const fn = httpsCallable<{ initData: string }, { token?: string; hasEmail: boolean }>(
      functions,
      CLOUD_FUNCTIONS.AUTH_TELEGRAM,
    );
    const { data } = await fn({ initData });
    if (data.token) {
      await signInWithCustomToken(auth, data.token);
    }
    return { hasEmail: data.hasEmail };
  },

  /**
   * Sends an OTP to the provided email.
   * initData is required by the backend to extract telegramId and nickname (saved into the OTP record).
   * Idempotent: if an active OTP already exists, the server won't send a new one.
   */
  async sendEmailOtp(email: string, initData: string): Promise<void> {
    const fn = httpsCallable<{ email: string; initData: string }, { success: boolean }>(
      functions,
      CLOUD_FUNCTIONS.AUTH_SEND_EMAIL_OTP,
    );
    await fn({ email, initData });
  },

  /**
   * Verifies the OTP, creates/finds the user by email, and links the telegramId.
   * Performs signInWithCustomToken upon success.
   */
  async verifyEmailOtp(email: string, code: string): Promise<void> {
    const fn = httpsCallable<{ email: string; code: string }, { token: string }>(
      functions,
      CLOUD_FUNCTIONS.AUTH_VERIFY_EMAIL_OTP,
    );
    const { data } = await fn({ email, code });
    await signInWithCustomToken(auth, data.token);
  },
};
