import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Mail } from 'lucide-react';
import { authApi, useAuthStore, OTP_CONFIG } from '@unbogi/shared';
import { tg } from '@/lib/telegram';
import { Input } from '@/ui/input';
import { IconButton } from '@/ui';
import { useT } from '@/hooks/use-t';
import { OtpInput } from './OtpInput';
import { OtpTimer } from './OtpTimer';

type Step = 'email' | 'code';

/**
 * Экран входа/регистрации — только для незарегистрированных TG пользователей.
 *
 * Шаг 1 (email):
 *   [✉️ | email@example.com ] [→]
 *
 * Шаг 2 (OTP) — UI трансформируется на месте:
 *   [⏱ 9:42 | · · 3 · · · ] [←]
 *   + 6-ячеечный OTP ввод ниже
 *
 * Дедупликация: если тот же email и OTP ещё не истёк — переключаем UI без API-запроса.
 */
export function LoginScreen() {
  const t = useT();
  const { pendingEmail, otpSentAt, setPendingOtp, clearPendingOtp } = useAuthStore();

  const [step, setStep] = useState<Step>(() =>
    // Восстанавливаем шаг из store если OTP ещё жив
    pendingEmail && otpSentAt && Date.now() - otpSentAt < OTP_CONFIG.LIFETIME_MS
      ? 'code'
      : 'email',
  );

  const [email, setEmail] = useState(pendingEmail ?? '');
  const [otpValue, setOtpValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpExpired, setOtpExpired] = useState(false);

  // --- Шаг 1: отправка email ---
  const handleSendEmail = async () => {
    if (!email || isLoading) return;
    setError(null);

    // Дедупликация: тот же email + OTP ещё жив → просто переключаем UI
    if (
      pendingEmail === email &&
      otpSentAt !== null &&
      Date.now() - otpSentAt < OTP_CONFIG.LIFETIME_MS
    ) {
      setOtpExpired(false);
      setStep('code');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.sendEmailOtp(email, tg.initData);
      const now = Date.now();
      setPendingOtp(email, now);
      setOtpValue('');
      setOtpExpired(false);
      tg.haptic('light');
      setStep('code');
    } catch (err: unknown) {
      setError(t.auth.errorGeneric);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Шаг 2: верификация OTP (автоматически при 6 цифрах) ---
  const handleOtpChange = async (value: string) => {
    setOtpValue(value);
    setError(null);

    if (value.length !== 6) return;

    setIsLoading(true);
    try {
      await authApi.verifyEmailOtp(email, value);
      tg.haptic('medium');
      // store.onAuthStateChanged поймает user → AUTHENTICATED
    } catch (err: any) {
      tg.haptic('heavy');
      const msg: string = err?.message ?? '';
      if (msg.includes('attempts')) setError(t.auth.errorTooManyAttempts);
      else if (msg.includes('expired')) setError(t.auth.errorExpired);
      else setError(t.auth.errorInvalidCode);
      setOtpValue('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setError(null);
    setOtpValue('');
    setStep('email');
  };

  const handleTimerExpired = useCallback(() => {
    setOtpExpired(true);
    clearPendingOtp();
  }, [clearPendingOtp]);

  const isEmailStep = step === 'email';

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 gap-2">
      {/* Лого + заголовок */}
      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
        className="w-28 h-28 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(147,51,234,0.3)] border border-purple-500/20"
      >
        <img src={`${import.meta.env.BASE_URL}icon.png`} alt="UnBoGi" className="w-full h-full object-cover" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-purple-400"
      >
        UnBoGi
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="text-sm uppercase tracking-[0.2em] text-[#c084fc] font-medium"
      >
        {t.auth.subtitle}
      </motion.p>

      {/* Поле ввода + кнопка — трансформируется между шагами */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="flex gap-2 items-center w-full max-w-[320px]"
      >
        <AnimatePresence mode="wait">
          {isEmailStep ? (
            <motion.div
              key="email-input"
              className="flex-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendEmail()}
                placeholder={t.auth.emailPlaceholder}
                icon={<Mail size={16} strokeWidth={1.5} />}
                disabled={isLoading}
                className="flex-1"
              />
            </motion.div>
          ) : (
            <motion.div
              key="code-input"
              className="flex-1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Строка с таймером вместо email input — визуальный индикатор */}
              <Input
                readOnly
                value={email}
                icon={
                  otpSentAt ? (
                    <OtpTimer sentAt={otpSentAt} onExpired={handleTimerExpired} />
                  ) : undefined
                }
                className="opacity-60 pointer-events-none"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Кнопка: → (вперёд) на шаге email, ← (назад) на шаге code */}
        <AnimatePresence mode="wait">
          {isEmailStep ? (
            <motion.div
              key="btn-forward"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <IconButton
                onClick={handleSendEmail}
                disabled={!email || isLoading}
                aria-label="Send code"
              >
                <ArrowRight size={16} strokeWidth={1.5} />
              </IconButton>
            </motion.div>
          ) : (
            <motion.div
              key="btn-back"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <IconButton onClick={handleBack} aria-label="Back to email">
                <ArrowLeft size={16} strokeWidth={1.5} />
              </IconButton>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* OTP ячейки — показываются только на шаге code */}
      <AnimatePresence>
        {step === 'code' && (
          <motion.div
            key="otp-cells"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-3 w-full max-w-[320px]"
          >
            <OtpInput value={otpValue} onChange={handleOtpChange} disabled={isLoading || otpExpired} />

            {/* Подсказка email */}
            {!otpExpired && (
              <p className="text-xs text-white/40 text-center">
                {t.auth.codeSent} <span className="text-white/60">{email}</span>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Сообщение об истечении / ошибке */}
      <AnimatePresence>
        {(error || otpExpired) && (
          <motion.p
            key="error-msg"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-red-400/80 text-center max-w-[260px]"
          >
            {otpExpired ? t.auth.otpExpired : error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
