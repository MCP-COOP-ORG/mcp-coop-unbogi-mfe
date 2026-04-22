import { z } from 'zod';
import { SCRATCH_CODE_FORMAT } from '../../constants/index.js';

export const ScratchCodeSchema = z.object({
  value: z.string().min(1),
  format: z.enum([SCRATCH_CODE_FORMAT.TEXT, SCRATCH_CODE_FORMAT.LINK, SCRATCH_CODE_FORMAT.QR]),
});
export type ScratchCode = z.infer<typeof ScratchCodeSchema>;

export const SendGiftSchema = z.object({
  idempotencyKey: z.string().min(1),
  receiverId: z.string().min(1),
  holidayId: z.string().min(1),
  greeting: z.string().min(1).max(250),
  unpackDate: z.string().datetime(),
  scratchCode: ScratchCodeSchema,
});
export type SendGiftRequest = z.infer<typeof SendGiftSchema>;

export const ScratchGiftSchema = z.object({
  giftId: z.string().min(1),
});
export type ScratchGiftRequest = z.infer<typeof ScratchGiftSchema>;

export const GiftResponseSchema = z.object({
  giftId: z.string(),
});
export type GiftResponse = z.infer<typeof GiftResponseSchema>;
