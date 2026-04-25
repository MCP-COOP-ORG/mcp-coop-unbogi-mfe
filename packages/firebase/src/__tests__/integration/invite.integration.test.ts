import * as admin from 'firebase-admin';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { InviteRepository } from '../../repositories/invite';
import { clearFirestoreData } from '../setup.integration';

// Ensure Firebase is initialized for integration tests connected to the emulator
if (!admin.apps.length) {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  process.env.GCLOUD_PROJECT = 'demo-unbogi';
  admin.initializeApp({ projectId: 'demo-unbogi' });
}

describe('Invite Flow (Integration)', () => {
  let inviteRepo: InviteRepository;
  let db: admin.firestore.Firestore;

  beforeAll(() => {
    db = admin.firestore();
    inviteRepo = new InviteRepository();
  });

  beforeEach(async () => {
    await clearFirestoreData();
  });

  it('should create a link invite and allow another user to accept it, establishing mutual contacts', async () => {
    const senderId = 'user-sender';
    const acceptorId = 'user-acceptor';

    // 1. Create Invite
    const token = await inviteRepo.createInvite(senderId);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    // Verify invite exists in Firestore
    const inviteDoc = await db.collection('invites').doc(token).get();
    expect(inviteDoc.exists).toBe(true);
    expect(inviteDoc.data()?.senderId).toBe(senderId);

    // 2. Accept Invite
    await inviteRepo.runAcceptInviteTransaction(token, acceptorId);

    // 3. Verify Invite is deleted after acceptance
    const deletedInvite = await db.collection('invites').doc(token).get();
    expect(deletedInvite.exists).toBe(false);

    // 4. Verify Contacts are established bidirectionally
    const contactSender = await db.collection('users').doc(senderId).collection('contacts').doc(acceptorId).get();
    const contactAcceptor = await db.collection('users').doc(acceptorId).collection('contacts').doc(senderId).get();

    expect(contactSender.exists).toBe(true);
    expect(contactSender.data()?.userId).toBe(acceptorId);

    expect(contactAcceptor.exists).toBe(true);
    expect(contactAcceptor.data()?.userId).toBe(senderId);
  });

  it('should create an email invite and allow redemption', async () => {
    const senderId = 'user-sender';
    const targetEmail = 'target@example.com';
    const acceptorUid = 'user-acceptor-email';

    // 1. Create Email Invite
    const token = await inviteRepo.createEmailInvite(senderId, targetEmail, 3600000); // 1 hour lifetime
    expect(token).toBeDefined();

    // Verify email invite exists
    const inviteDoc = await db.collection('invites').doc(token).get();
    expect(inviteDoc.exists).toBe(true);
    expect(inviteDoc.data()?.targetEmail).toBe(targetEmail);

    // 2. Redeem Email Invite
    await inviteRepo.runRedeemEmailInviteTransaction(token, acceptorUid);

    // 3. Verify Invite is deleted after redemption
    const deletedInvite = await db.collection('invites').doc(token).get();
    expect(deletedInvite.exists).toBe(false);

    // 4. Verify Contacts are established bidirectionally
    const contactSender = await db.collection('users').doc(senderId).collection('contacts').doc(acceptorUid).get();
    const contactAcceptor = await db.collection('users').doc(acceptorUid).collection('contacts').doc(senderId).get();

    expect(contactSender.exists).toBe(true);
    expect(contactSender.data()?.userId).toBe(acceptorUid);

    expect(contactAcceptor.exists).toBe(true);
    expect(contactAcceptor.data()?.userId).toBe(senderId);
  });
});
