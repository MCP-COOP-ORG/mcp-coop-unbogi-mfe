import { httpsCallable } from 'firebase/functions';
import { signInWithCustomToken } from 'firebase/auth';
import { functions, auth } from '../../firebase';
import { CLOUD_FUNCTIONS } from '../../constants';

export const authApi = {
  async authenticateTelegram(initData: string) {
    const fn = httpsCallable<{ initData: string }, { token: string }>(
      functions,
      CLOUD_FUNCTIONS.AUTH_TELEGRAM,
    );
    const { data } = await fn({ initData });
    await signInWithCustomToken(auth, data.token);
  },

  async sendEmailOtp(email: string) {
    const fn = httpsCallable<{ email: string }, { success: boolean }>(
      functions,
      CLOUD_FUNCTIONS.AUTH_SEND_EMAIL_OTP,
    );
    await fn({ email });
  },

  async verifyEmailOtp(email: string, code: string) {
    const fn = httpsCallable<{ email: string; code: string }, { token: string }>(
      functions,
      CLOUD_FUNCTIONS.AUTH_VERIFY_EMAIL_OTP,
    );
    const { data } = await fn({ email, code });
    await signInWithCustomToken(auth, data.token);
  },
};
