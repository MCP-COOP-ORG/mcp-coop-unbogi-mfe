import { z } from 'zod';

export const TelegramAuthSchema = z.object({
  initData: z.string().min(1),
});
export type TelegramAuthRequest = z.infer<typeof TelegramAuthSchema>;

// Ответ telegramAuth: token только если пользователь уже зарегистрирован (hasEmail: true)
export const TelegramAuthResponseSchema = z.object({
  token: z.string().optional(),
  hasEmail: z.boolean(),
});
export type TelegramAuthResponse = z.infer<typeof TelegramAuthResponseSchema>;

// initData опционален — если пришел, бэкенд извлекает telegramId
export const SendOtpSchema = z.object({
  email: z.string().email(),
  initData: z.string().optional(),
});
export type SendOtpRequest = z.infer<typeof SendOtpSchema>;

export const VerifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});
export type VerifyOtpRequest = z.infer<typeof VerifyOtpSchema>;

// verifyEmailOtp по-прежнему возвращает token для signInWithCustomToken
export const AuthResponseSchema = z.object({
  token: z.string(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// ── Email validation helpers (SSOT — derived from SendOtpSchema) ───────────
/** Reusable email schema — the single source of truth across the monorepo. */
export const emailSchema = SendOtpSchema.shape.email;

/** Quick boolean predicate — use instead of raw regexes or ad-hoc Zod calls. */
export function isValidEmail(value: string): boolean {
  return emailSchema.safeParse(value).success;
}
