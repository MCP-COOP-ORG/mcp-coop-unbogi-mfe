import type { StartedTestContainer } from 'testcontainers';
import { GenericContainer, Wait } from 'testcontainers';

let container: StartedTestContainer | undefined;

export async function setup({ provide }: { provide: <T>(key: string, value: T) => void }) {
  console.log('Starting Firestore Emulator container...');

  container = await new GenericContainer('gcr.io/google.com/cloudsdktool/google-cloud-cli:emulators')
    .withExposedPorts(8080)
    .withCommand(['gcloud', 'beta', 'emulators', 'firestore', 'start', '--host-port=0.0.0.0:8080'])
    .withEnvironment({ FIRESTORE_PROJECT_ID: 'demo-unbogi' })
    .withWaitStrategy(Wait.forListeningPorts())
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(8080);

  const emulatorHost = `${host}:${port}`;
  process.env.FIRESTORE_EMULATOR_HOST = emulatorHost;
  process.env.GCLOUD_PROJECT = 'demo-unbogi';

  provide('FIRESTORE_EMULATOR_HOST', emulatorHost);

  console.log(`Firestore Emulator started at ${process.env.FIRESTORE_EMULATOR_HOST}`);
}

export async function teardown() {
  if (container) {
    console.log('Stopping Firestore Emulator container...');
    await container.stop();
  }
}

declare module 'vitest' {
  export interface ProvidedContext {
    FIRESTORE_EMULATOR_HOST: string;
  }
}
