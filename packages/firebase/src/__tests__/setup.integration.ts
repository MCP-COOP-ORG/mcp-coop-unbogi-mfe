// Global setup hook

import { randomUUID } from 'node:crypto';
import * as admin from 'firebase-admin';
import { beforeAll, beforeEach, inject } from 'vitest';

// Use a unique project ID for each test worker/file to avoid cross-contamination
// when tests run in parallel and clear their databases.
const TEST_PROJECT_ID = `demo-${randomUUID()}`;

// Clear the Firestore emulator database before each test
export async function clearFirestoreData() {
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST || inject('FIRESTORE_EMULATOR_HOST') || '127.0.0.1:8080';

  try {
    const response = await fetch(
      `http://${emulatorHost}/emulator/v1/projects/${TEST_PROJECT_ID}/databases/(default)/documents`,
      {
        method: 'DELETE',
      },
    );
    if (!response.ok) {
      console.warn('Failed to clear emulator data:', response.statusText);
    }
  } catch (error) {
    console.error('Error clearing emulator data:', error);
  }
}

beforeAll(() => {
  if (!admin.apps.length) {
    process.env.FIRESTORE_EMULATOR_HOST =
      process.env.FIRESTORE_EMULATOR_HOST || inject('FIRESTORE_EMULATOR_HOST') || '127.0.0.1:8080';
    process.env.GCLOUD_PROJECT = TEST_PROJECT_ID;
    admin.initializeApp({ projectId: TEST_PROJECT_ID });
  }
});

beforeEach(async () => {
  await clearFirestoreData();
});
