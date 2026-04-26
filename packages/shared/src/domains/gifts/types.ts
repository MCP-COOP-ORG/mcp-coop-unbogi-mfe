export type ScratchCodeFormat = 'code' | 'qr-code';

export interface ScratchCode {
  value: string;
  format: ScratchCodeFormat;
}

export interface GiftRecord {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  holidayId: string;
  imageUrl: string;
  greeting: string;
  unpackDate: string;
  scratchCode: ScratchCode;
  scratchedAt: string | null;
  createdAt: string;
}

export interface SendGiftPayload {
  idempotencyKey: string;
  receiverId: string;
  holidayId: string;
  greeting: string;
  unpackDate: string;
  scratchCode: ScratchCode;
}

export interface GiftsState {
  isLoaded: boolean;
  isLoading: boolean;
  receivedGifts: GiftRecord[];
  openedGifts: GiftRecord[];
  loadGifts: () => Promise<void>;
  sendGift: (payload: SendGiftPayload) => Promise<void>;
  scratchGift: (giftId: string) => Promise<void>;
  reset: () => void;
}
