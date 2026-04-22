import { SendOtpSchema, VerifyOtpSchema } from '@unbogi/contracts';
import { authApi, OTP_CONFIG, useAuthStore } from '@unbogi/shared';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useT } from '@/hooks/use-t';
import { tg } from '@/lib/telegram';

type Step = 'email' | 'code';

interface AuthState {
  step: Step;
  email: string;
  code: string;
  isEmailDirty: boolean;
  isCodeDirty: boolean;
  isEmailTouched: boolean;
  isCodeTouched: boolean;
  isLoading: boolean;
  apiError: string | null;
  otpExpired: boolean;
}

export function useAuthForm() {
  const t = useT();
  const { pendingEmail, otpSentAt, setPendingOtp, clearPendingOtp } = useAuthStore();

  // Pack multiple states into a single object for better state cohesion
  const [state, setState] = useState<AuthState>(() => ({
    step: pendingEmail && otpSentAt && Date.now() - otpSentAt < OTP_CONFIG.LIFETIME_MS ? 'code' : 'email',
    email: pendingEmail ?? '',
    code: '',
    isEmailDirty: false,
    isCodeDirty: false,
    isEmailTouched: false,
    isCodeTouched: false,
    isLoading: false,
    apiError: null,
    otpExpired: false,
  }));

  // Memoize validation to prevent redundant Zod parsing
  const isEmailValid = useMemo(() => SendOtpSchema.shape.email.safeParse(state.email).success, [state.email]);

  const isCodeValid = useMemo(() => VerifyOtpSchema.shape.code.safeParse(state.code).success, [state.code]);

  const emailError = state.isEmailTouched && state.isEmailDirty && !isEmailValid ? t.auth.invalidEmail : null;
  const codeError = state.isCodeTouched && state.isCodeDirty && !isCodeValid && state.code.length > 0 ? t.auth.invalidCode : null;

  // Use useCallback for stable handler references
  const handleEmailChange = useCallback((value: string) => {
    setState((prev) => ({ ...prev, email: value, isEmailDirty: true, apiError: null }));
  }, []);

  const handleEmailBlur = useCallback(() => {
    setState((prev) => ({ ...prev, isEmailTouched: true }));
  }, []);

  const handleCodeChange = useCallback((value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 6) {
      // Automatically clear backend apiError as soon as user starts typing again
      setState((prev) => ({ ...prev, code: digitsOnly, isCodeDirty: true, apiError: null }));
    }
  }, []);

  const handleCodeBlur = useCallback(() => {
    setState((prev) => ({ ...prev, isCodeTouched: true }));
  }, []);

  // Race condition protection for fast clicks
  const isSubmitting = useRef(false);

  const handleSendEmail = useCallback(async () => {
    if (!isEmailValid || state.isLoading || isSubmitting.current) return;

    setState((prev) => ({ ...prev, apiError: null, isEmailDirty: true }));

    // Deduplication
    if (pendingEmail === state.email && otpSentAt !== null && Date.now() - otpSentAt < OTP_CONFIG.LIFETIME_MS) {
      setState((prev) => ({ ...prev, otpExpired: false, step: 'code' }));
      return;
    }

    isSubmitting.current = true;
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await authApi.sendEmailOtp(state.email, tg.initData);
      setPendingOtp(state.email, Date.now());
      tg.haptic('light');
      setState((prev) => ({
        ...prev,
        code: '',
        isCodeDirty: false,
        otpExpired: false,
        step: 'code',
      }));
    } catch (_err: unknown) {
      setState((prev) => ({ ...prev, apiError: t.auth.errorGeneric }));
    } finally {
      isSubmitting.current = false;
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [isEmailValid, state.isLoading, state.email, pendingEmail, otpSentAt, setPendingOtp, t.auth.errorGeneric]);

  const handleSubmitCode = useCallback(async () => {
    if (!isCodeValid || state.isLoading || state.otpExpired || isSubmitting.current) return;

    setState((prev) => ({ ...prev, apiError: null, isCodeDirty: true }));

    isSubmitting.current = true;
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await authApi.verifyEmailOtp(state.email, state.code);
      tg.haptic('medium');
    } catch (err: unknown) {
      tg.haptic('heavy');
      const msg = err instanceof Error ? err.message : String(err);
      let errorMsg: string = t.auth.errorInvalidCode;

      if (msg.includes('attempts')) errorMsg = t.auth.errorTooManyAttempts;
      else if (msg.includes('expired')) errorMsg = t.auth.errorExpired;

      setState((prev) => ({
        ...prev,
        apiError: errorMsg,
        // We do NOT clear the code right away, allowing the user to see what they typed,
        // unless it's expired or too many attempts.
        code: msg.includes('attempts') || msg.includes('expired') ? '' : prev.code,
        isCodeDirty: false,
        isCodeTouched: false,
      }));
    } finally {
      isSubmitting.current = false;
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [isCodeValid, state.isLoading, state.otpExpired, state.email, state.code, t.auth]);

  const handleBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      apiError: null,
      code: '',
      isCodeDirty: false,
      isCodeTouched: false,
      step: 'email',
    }));
  }, []);

  const handleTimerExpired = useCallback(() => {
    setState((prev) => ({ ...prev, otpExpired: true }));
    clearPendingOtp();
  }, [clearPendingOtp]);

  const errorToShow = state.otpExpired
    ? t.auth.otpExpired
    : state.apiError || (state.step === 'email' ? emailError : codeError);

  return {
    ...state,
    errorToShow,
    isEmailValid,
    isCodeValid,
    otpSentAt,
    handleEmailChange,
    handleEmailBlur,
    handleCodeChange,
    handleCodeBlur,
    handleSendEmail,
    handleSubmitCode,
    handleBack,
    handleTimerExpired,
  };
}
