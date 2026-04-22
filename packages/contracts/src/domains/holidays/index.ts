import { z } from 'zod';

export const HolidaySchema = z.object({
  id: z.string(),
  name: z.string(),
  imageUrl: z.string().url().or(z.string()), // sometimes they might be relative
  date: z.string().optional(),
  defaultGreeting: z.string().optional(),
});
export type Holiday = z.infer<typeof HolidaySchema>;

export const HolidayListResponseSchema = z.object({
  holidays: z.array(HolidaySchema),
});
export type HolidayListResponse = z.infer<typeof HolidayListResponseSchema>;
