import { describe, expect, it } from 'vitest';
import { sendFormSchema } from './validation';

describe('gifts validation', () => {
  it('validates a correct form data with code format', () => {
    const validData = {
      receiverId: 'user1',
      holidayId: 'h1',
      greeting: 'Happy Birthday',
      unpackDate: new Date(),
      payload: { format: 'code' as const, content: '12345' },
    };

    expect(sendFormSchema.parse(validData)).toEqual(validData);
  });

  it('fails if required fields are missing', () => {
    const invalidData = {
      receiverId: '',
      holidayId: 'h1',
      greeting: 'Happy Birthday',
      unpackDate: new Date(),
      payload: { format: 'code' as const, content: '12345' },
    };

    const result = sendFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
