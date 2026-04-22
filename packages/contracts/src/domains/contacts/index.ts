import { z } from "zod";

export const ContactSchema = z.object({
  id: z.string(),
  displayName: z.string(),
});
export type Contact = z.infer<typeof ContactSchema>;

export const ContactListResponseSchema = z.object({
  contacts: z.array(ContactSchema),
});
export type ContactListResponse = z.infer<typeof ContactListResponseSchema>;
