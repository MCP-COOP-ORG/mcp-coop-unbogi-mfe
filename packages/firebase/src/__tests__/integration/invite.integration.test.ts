import * as admin from 'firebase-admin';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { InviteRepository } from '../../repositories/invite';
import { clearFirestoreData } from '../setup.integration';

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

    // 3. Verify Invite is marked as ACCEPTED
    const acceptedInvite = await db.collection('invites').doc(token).get();
    expect(acceptedInvite.exists).toBe(true);
    expect(acceptedInvite.data()?.status).toBe('accepted');
    expect(acceptedInvite.data()?.acceptedBy).toBe(acceptorId);

    // 4. Verify Contacts are established bidirectionally
    const contactSender = await db.collection('contacts').doc(`${senderId}_${acceptorId}`).get();
    const contactAcceptor = await db.collection('contacts').doc(`${acceptorId}_${senderId}`).get();

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

    // 3. Verify Invite is marked as ACCEPTED
    const acceptedInvite = await db.collection('invites').doc(token).get();
    expect(acceptedInvite.exists).toBe(true);
    expect(acceptedInvite.data()?.status).toBe('accepted');
    expect(acceptedInvite.data()?.acceptedBy).toBe(acceptorUid);

    // 4. Verify Contacts are established bidirectionally
    const contactSender = await db.collection('contacts').doc(`${senderId}_${acceptorUid}`).get();
    const contactAcceptor = await db.collection('contacts').doc(`${acceptorUid}_${senderId}`).get();

    expect(contactSender.exists).toBe(true);
    expect(contactSender.data()?.userId).toBe(acceptorUid);

    expect(contactAcceptor.exists).toBe(true);
    expect(contactAcceptor.data()?.userId).toBe(senderId);
  });
});
