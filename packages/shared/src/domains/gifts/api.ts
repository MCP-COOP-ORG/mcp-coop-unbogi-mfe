import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';
import { CLOUD_FUNCTIONS } from '../../constants';
import type { GiftRecord, SendGiftPayload } from './types';

export const giftsApi = {
  async getReceived(): Promise<GiftRecord[]> {
    const fn = httpsCallable<Record<string, never>, { gifts: GiftRecord[] }>(
      functions,
      CLOUD_FUNCTIONS.GIFTS_GET_RECEIVED,
    );
    const { data } = await fn({});
    return data.gifts;
  },

  async getOpened(): Promise<GiftRecord[]> {
    const fn = httpsCallable<Record<string, never>, { gifts: GiftRecord[] }>(
      functions,
      CLOUD_FUNCTIONS.GIFTS_GET_OPENED,
    );
    const { data } = await fn({});
    return data.gifts;
  },

  async send(payload: SendGiftPayload): Promise<{ giftId: string }> {
    const fn = httpsCallable<SendGiftPayload, { giftId: string }>(
      functions,
      CLOUD_FUNCTIONS.GIFTS_SEND,
    );
    const { data } = await fn(payload);
    return data;
  },

  async scratch(giftId: string): Promise<void> {
    const fn = httpsCallable<{ giftId: string }, { success: boolean }>(
      functions,
      CLOUD_FUNCTIONS.GIFTS_SCRATCH,
    );
    await fn({ giftId });
  },
};
