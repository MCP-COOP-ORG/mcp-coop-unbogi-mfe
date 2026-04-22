import { z } from "zod";

export const TelegramAuthSchema = z.object({
  initData: z.string().min(1),
});
export type TelegramAuthRequest = z.infer<typeof TelegramAuthSchema>;

export const SendOtpSchema = z.object({
  email: z.string().email(),
});
export type SendOtpRequest = z.infer<typeof SendOtpSchema>;

export const VerifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});
export type VerifyOtpRequest = z.infer<typeof VerifyOtpSchema>;

export const AuthResponseSchema = z.object({
  token: z.string(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
