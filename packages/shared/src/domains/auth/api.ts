import { httpsCallable } from 'firebase/functions';
import { signInWithCustomToken } from 'firebase/auth';
import { functions, auth } from '../../firebase';
import { CLOUD_FUNCTIONS } from '../../constants';

export const authApi = {
  /**
   * Telegram bootstrapping:
   * - Валидирует initData на бэке (HMAC)
   * - Если пользователь зарегистрирован (нашли по telegramId) → signInWithCustomToken, hasEmail: true
   * - Если нет → hasEmail: false, Firebase сессия не открывается
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
   * Отправляет OTP на email.
   * initData нужен бэку для извлечения telegramId и nickname (сохранятся в OTP-запись).
   * Идемпотентен: если активный OTP уже есть — сервер не высылает новый.
   */
  async sendEmailOtp(email: string, initData: string): Promise<void> {
    const fn = httpsCallable<{ email: string; initData: string }, { success: boolean }>(
      functions,
      CLOUD_FUNCTIONS.AUTH_SEND_EMAIL_OTP,
    );
    await fn({ email, initData });
  },

  /**
   * Верифицирует OTP, создаёт/находит пользователя по email, привязывает telegramId.
   * После успеха делает signInWithCustomToken.
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
