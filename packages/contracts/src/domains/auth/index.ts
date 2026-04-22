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

// initData обязателен — сервер извлекает telegramId и nickname для сохранения в OTP-запись
export const SendOtpSchema = z.object({
  email: z.string().email(),
  initData: z.string().min(1),
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
