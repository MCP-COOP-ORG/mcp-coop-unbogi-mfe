import { z } from 'zod';

export const CreateInviteSchema = z.object({});

export const AcceptInviteSchema = z.object({
  token: z.string().min(1),
});

export const SendEmailInviteSchema = z.object({
  targetEmail: z.string().email(),
});

export const RedeemEmailInviteSchema = z.object({
  inviteToken: z.string().min(1),
  initData: z.string().min(1),
});

export type CreateInvitePayload = z.infer<typeof CreateInviteSchema>;
export type AcceptInvitePayload = z.infer<typeof AcceptInviteSchema>;
export type SendEmailInvitePayload = z.infer<typeof SendEmailInviteSchema>;
export type RedeemEmailInvitePayload = z.infer<typeof RedeemEmailInviteSchema>;
