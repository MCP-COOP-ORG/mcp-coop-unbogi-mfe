import { httpsCallable } from 'firebase/functions';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGiftsStore } from './store';
import type { GiftRecord, SendGiftPayload } from './types';

const mockHttpsCallable = vi.mocked(httpsCallable);

const createGift = (overrides: Partial<GiftRecord> = {}): GiftRecord => ({
  id: 'gift-1',
  senderId: 'sender-1',
  senderName: 'Alice',
  receiverId: 'receiver-1',
  holidayId: 'holiday-1',
  imageUrl: 'https://example.com/img.png',
  greeting: 'Happy birthday!',
  unpackDate: '2025-01-01',
  scratchCode: { value: 'ABC123', format: 'code' },
  scratchedAt: null,
  createdAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

describe('useGiftsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGiftsStore.setState({
      isLoaded: false,
      isLoading: false,
      receivedGifts: [],
      openedGifts: [],
    });
  });

  describe('initial state', () => {
    it('starts empty and not loaded', () => {
      const state = useGiftsStore.getState();
      expect(state.isLoaded).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.receivedGifts).toEqual([]);
      expect(state.openedGifts).toEqual([]);
    });
  });

  describe('loadGifts', () => {
    it('loads and sorts received gifts by createdAt descending', async () => {
      const older = createGift({ id: 'g1', createdAt: '2025-01-01T00:00:00Z' });
      const newer = createGift({ id: 'g2', createdAt: '2025-06-01T00:00:00Z' });
      const opened = createGift({ id: 'g3' });

      const receivedFn = vi.fn().mockResolvedValue({ data: { gifts: [older, newer] } });
      const openedFn = vi.fn().mockResolvedValue({ data: { gifts: [opened] } });

      mockHttpsCallable
        .mockReturnValueOnce(receivedFn as never) // getReceived
        .mockReturnValueOnce(openedFn as never); // getOpened

      await useGiftsStore.getState().loadGifts();

      const state = useGiftsStore.getState();
      expect(state.isLoaded).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.receivedGifts[0].id).toBe('g2'); // newer first
      expect(state.receivedGifts[1].id).toBe('g1');
      expect(state.openedGifts).toEqual([opened]);
    });

    it('does not reload if already loading', async () => {
      useGiftsStore.setState({ isLoading: true });
      const fn = vi.fn();
      mockHttpsCallable.mockReturnValue(fn as never);

      await useGiftsStore.getState().loadGifts();

      expect(fn).not.toHaveBeenCalled();
    });

    it('sets isLoading only when data is not yet loaded', async () => {
      useGiftsStore.setState({ isLoaded: true });
      const receivedFn = vi.fn().mockResolvedValue({ data: { gifts: [] } });
      const openedFn = vi.fn().mockResolvedValue({ data: { gifts: [] } });
      mockHttpsCallable.mockReturnValueOnce(receivedFn as never).mockReturnValueOnce(openedFn as never);

      // Should NOT set isLoading to true since isLoaded is already true (background refresh)
      const loadPromise = useGiftsStore.getState().loadGifts();
      expect(useGiftsStore.getState().isLoading).toBe(false);
      await loadPromise;
    });

    it('handles API errors gracefully', async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error('network error'));
      mockHttpsCallable.mockReturnValue(errorFn as never);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await useGiftsStore.getState().loadGifts();

      expect(useGiftsStore.getState().isLoading).toBe(false);
      expect(useGiftsStore.getState().isLoaded).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('sendGift', () => {
    it('calls the send API with payload', async () => {
      const sendFn = vi.fn().mockResolvedValue({ data: { giftId: 'new-gift' } });
      mockHttpsCallable.mockReturnValue(sendFn as never);

      const payload: SendGiftPayload = {
        idempotencyKey: 'key-1',
        receiverId: 'receiver-1',
        holidayId: 'holiday-1',
        greeting: 'Hello!',
        unpackDate: '2025-12-25',
        scratchCode: { value: 'XYZ', format: 'code' },
      };

      await useGiftsStore.getState().sendGift(payload);

      expect(sendFn).toHaveBeenCalledWith(payload);
    });
  });

  describe('scratchGift', () => {
    it('calls the scratch API with giftId', async () => {
      const scratchFn = vi.fn().mockResolvedValue({ data: { success: true } });
      mockHttpsCallable.mockReturnValue(scratchFn as never);

      await useGiftsStore.getState().scratchGift('gift-123');

      expect(scratchFn).toHaveBeenCalledWith({ giftId: 'gift-123' });
    });

    it('handles scratch errors gracefully', async () => {
      const scratchFn = vi.fn().mockRejectedValue(new Error('fail'));
      mockHttpsCallable.mockReturnValue(scratchFn as never);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await useGiftsStore.getState().scratchGift('gift-123');

      // Should not throw
      expect(useGiftsStore.getState()).toBeDefined();
      consoleSpy.mockRestore();
    });
  });

  describe('reset', () => {
    it('resets store to initial state', () => {
      useGiftsStore.setState({
        isLoaded: true,
        isLoading: false,
        receivedGifts: [createGift()],
        openedGifts: [createGift()],
      });

      useGiftsStore.getState().reset();

      expect(useGiftsStore.getState().isLoaded).toBe(false);
      expect(useGiftsStore.getState().receivedGifts).toEqual([]);
      expect(useGiftsStore.getState().openedGifts).toEqual([]);
    });
  });
});
