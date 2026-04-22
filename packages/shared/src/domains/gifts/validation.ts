import { z } from 'zod';
import { GIFT_CONFIG } from '../../constants';

export const sendFormSchema = z.object({
  receiverId: z.string().min(1, 'Contact is required'),
  holidayId: z.string().min(1, 'Holiday is required'),
  greeting: z
    .string()
    .min(1, 'Greeting is required')
    .max(GIFT_CONFIG.GREETING_MAX_LENGTH, `Max ${GIFT_CONFIG.GREETING_MAX_LENGTH} characters`),
  unpackDate: z.date({ message: 'Date is required' }),
  payload: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('text'),
      content: z.string().min(1, 'Code is required'),
    }),
    z.object({
      type: z.literal('qr'),
      content: z.string().min(1, 'QR code is required'),
    }),
  ]),
});

export type SendFormData = z.infer<typeof sendFormSchema>;
