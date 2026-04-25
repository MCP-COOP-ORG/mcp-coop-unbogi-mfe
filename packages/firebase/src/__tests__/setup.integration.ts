// Clear the Firestore emulator database before each test
export async function clearFirestoreData() {
  const projectId = process.env.GCLOUD_PROJECT || 'demo-unbogi';
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';

  try {
    const response = await fetch(
      `http://${emulatorHost}/emulator/v1/projects/${projectId}/databases/(default)/documents`,
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

// Global setup hook
import { beforeEach } from 'vitest';

beforeEach(async () => {
  await clearFirestoreData();
});
