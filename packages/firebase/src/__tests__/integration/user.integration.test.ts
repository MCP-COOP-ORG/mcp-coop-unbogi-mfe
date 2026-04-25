import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { UserRepository } from '../../repositories/user';
import { clearFirestoreData } from '../setup.integration';

describe('UserRepository (Integration)', () => {
  let userRepo: UserRepository;

  beforeAll(() => {
    userRepo = new UserRepository();
  });

  beforeEach(async () => {
    await clearFirestoreData();
  });

  it('should upsert a user and read it back by ID', async () => {
    const uid = 'test-uid-123';
    const data = {
      uid,
      provider: 'telegram',
      nickname: 'TestUser',
    };

    await userRepo.upsertUser(uid, data);

    const user = await userRepo.findById(uid);
    expect(user).toBeDefined();
    expect(user?.nickname).toBe('TestUser');
    expect(user?.provider).toBe('telegram');
  });

  it('should find a user by telegramId', async () => {
    const uid = 'test-telegram-user';
    const data = {
      uid,
      provider: 'telegram',
      telegramId: 123456789,
    };

    await userRepo.upsertUser(uid, data);

    const user = await userRepo.findByTelegramId(123456789);
    expect(user).toBeDefined();
    expect(user?.uid).toBe(uid);
  });

  it('should return null when finding non-existent user by ID or telegramId', async () => {
    const byId = await userRepo.findById('missing');
    expect(byId).toBeNull();

    const byTelegramId = await userRepo.findByTelegramId(9999999);
    expect(byTelegramId).toBeNull();
  });
});
