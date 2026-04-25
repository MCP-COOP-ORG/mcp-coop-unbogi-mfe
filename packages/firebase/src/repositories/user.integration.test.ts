import * as admin from 'firebase-admin';
import { beforeAll, describe, expect, it } from 'vitest';

// import { UserRepository } from './user';

// Ensure admin is initialized connecting to the emulator
beforeAll(() => {
  if (!admin.apps.length) {
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
    process.env.GCLOUD_PROJECT = 'demo-unbogi';
    admin.initializeApp({ projectId: 'demo-unbogi' });
  }
});

describe('UserRepository (Integration)', () => {
  // let userRepo: UserRepository;

  beforeAll(() => {
    // userRepo = new UserRepository(admin.firestore());
  });

  it('should write and read a user document from the Firestore emulator', async () => {
    // Arrange
    const db = admin.firestore();
    const testUserId = 'test-user-123';

    // Act
    await db.collection('users').doc(testUserId).set({ name: 'Test' });
    // const user = await userRepo.findById(testUserId);

    const doc = await db.collection('users').doc(testUserId).get();

    // Assert
    expect(doc.exists).toBe(true);
    expect(doc.data()?.name).toBe('Test');
  });
});
