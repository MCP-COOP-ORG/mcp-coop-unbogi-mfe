import { z } from 'zod';

export const CreateInviteSchema = z.object({});

export const AcceptInviteSchema = z.object({
  token: z.string().min(1),
});

export type CreateInvitePayload = z.infer<typeof CreateInviteSchema>;
export type AcceptInvitePayload = z.infer<typeof AcceptInviteSchema>;
