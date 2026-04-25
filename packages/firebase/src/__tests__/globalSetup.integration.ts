import { GenericContainer, Wait } from 'testcontainers';

let container: any;

export async function setup() {
  console.log('Starting Firestore Emulator container...');
  
  // We use the firestore-emulator image which exposes 8080 by default.
  container = await new GenericContainer('mtlynch/firestore-emulator-docker:latest')
    .withExposedPorts(8080)
    .withEnvironment({ FIRESTORE_PROJECT_ID: 'demo-unbogi' })
    .withWaitStrategy(Wait.forListeningPorts())
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(8080);
  
  process.env.FIRESTORE_EMULATOR_HOST = `${host}:${port}`;
  process.env.GCLOUD_PROJECT = 'demo-unbogi';
  
  console.log(`Firestore Emulator started at ${process.env.FIRESTORE_EMULATOR_HOST}`);
}

export async function teardown() {
  if (container) {
    console.log('Stopping Firestore Emulator container...');
    await container.stop();
  }
}
