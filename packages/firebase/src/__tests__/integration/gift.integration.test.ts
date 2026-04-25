import * as admin from 'firebase-admin';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { GiftRepository } from '../../repositories/gift';
import { clearFirestoreData } from '../setup.integration';

describe('GiftRepository (Integration)', () => {
  let giftRepo: GiftRepository;
  let db: admin.firestore.Firestore;

  beforeAll(() => {
    db = admin.firestore();
    giftRepo = new GiftRepository();
  });

  beforeEach(async () => {
    await clearFirestoreData();
  });

  const getDummyGiftData = () => ({
    senderId: 'sender-1',
    receiverId: 'receiver-1',
    holidayId: 'xmas-2026',
    imageUrl: 'http://example.com/gift.png',
    greeting: 'Happy Holidays',
    unpackDate: new Date(),
    scratchCode: { value: 'ABCD-1234', format: 'ABCD-####' },
    scratchedAt: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  it('should create a gift successfully', async () => {
    const idempotencyKey = 'gift-123';
    const data = getDummyGiftData();

    const created = await giftRepo.createGift(idempotencyKey, data);
    expect(created).toBe(true);

    const doc = await db.collection('gifts').doc(idempotencyKey).get();
    expect(doc.exists).toBe(true);
    expect(doc.data()?.senderId).toBe('sender-1');
  });

  it('should return false when creating a gift with an existing idempotency key', async () => {
    const idempotencyKey = 'gift-duplicate';
    const data = getDummyGiftData();

    const created1 = await giftRepo.createGift(idempotencyKey, data);
    expect(created1).toBe(true);

    const created2 = await giftRepo.createGift(idempotencyKey, data);
    expect(created2).toBe(false); // Duplicate key
  });

  it('should allow the receiver to scratch the gift', async () => {
    const idempotencyKey = 'gift-scratch';
    const data = getDummyGiftData();
    data.receiverId = 'receiver-scratch';

    await giftRepo.createGift(idempotencyKey, data);

    await giftRepo.scratchGift(idempotencyKey, 'receiver-scratch');

    const doc = await db.collection('gifts').doc(idempotencyKey).get();
    expect(doc.data()?.scratchedAt).not.toBeNull();
  });

  it('should throw an error when a non-receiver tries to scratch the gift', async () => {
    const idempotencyKey = 'gift-unauthorized';
    const data = getDummyGiftData();
    data.receiverId = 'receiver-only';

    await giftRepo.createGift(idempotencyKey, data);

    await expect(giftRepo.scratchGift(idempotencyKey, 'hacker')).rejects.toThrowError('Access denied');
  });

  it('should list received (unscratched) gifts', async () => {
    await giftRepo.createGift('gift-unscratched-1', { ...getDummyGiftData(), receiverId: 'user-A' });
    await giftRepo.createGift('gift-unscratched-2', { ...getDummyGiftData(), receiverId: 'user-A' });

    // Scratched gift for user A (should not be in received list)
    await giftRepo.createGift('gift-scratched-1', { ...getDummyGiftData(), receiverId: 'user-A' });
    await giftRepo.scratchGift('gift-scratched-1', 'user-A');

    // Gift for another user
    await giftRepo.createGift('gift-unscratched-3', { ...getDummyGiftData(), receiverId: 'user-B' });

    const received = await giftRepo.getReceivedGifts('user-A');
    expect(received.docs.length).toBe(2);
  });

  it('should list opened (scratched) gifts', async () => {
    // Add 1 scratched, 1 unscratched for user-A
    await giftRepo.createGift('gift-opened-1', { ...getDummyGiftData(), receiverId: 'user-A' });
    await giftRepo.createGift('gift-not-opened-1', { ...getDummyGiftData(), receiverId: 'user-A' });

    await giftRepo.scratchGift('gift-opened-1', 'user-A');

    const opened = await giftRepo.getOpenedGifts('user-A');
    expect(opened.docs.length).toBe(1);
    expect(opened.docs[0].id).toBe('gift-opened-1');
  });
});
