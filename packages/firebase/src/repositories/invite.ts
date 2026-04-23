import { COLLECTIONS, INVITE_STATUS } from '@unbogi/contracts';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export class InviteRepository {
  private get db() {
    return admin.firestore();
  }

  /**
   * Creates a new pending invite document
   */
  async createInvite(senderId: string): Promise<string> {
    const inviteRef = this.db.collection(COLLECTIONS.INVITES).doc();
    const token = inviteRef.id;

    await inviteRef.set({
      senderId,
      token,
      status: INVITE_STATUS.PENDING,
      acceptedBy: null,
      createdAt: FieldValue.serverTimestamp(),
    });

    return token;
  }

  /**
   * Creates a new pending email invite document with expiration
   */
  async createEmailInvite(senderId: string, targetEmail: string, expiresInMs: number): Promise<string> {
    const inviteRef = this.db.collection(COLLECTIONS.INVITES).doc();
    const token = inviteRef.id;
    const expiresAt = new Date(Date.now() + expiresInMs);

    await inviteRef.set({
      senderId,
      targetEmail,
      token,
      status: INVITE_STATUS.PENDING,
      type: 'email',
      acceptedBy: null,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    });

    return token;
  }

  /**
   * Runs the acceptance transaction: marks invite as ACCEPTED and creates a deterministic contact entry.
   * Deterministic contact ID prevents duplicate contacts between the same users.
   */
  async runAcceptInviteTransaction(token: string, acceptorId: string): Promise<void> {
    const inviteRef = this.db.collection(COLLECTIONS.INVITES).doc(token);

    await this.db.runTransaction(async (tx) => {
      const inviteSnap = await tx.get(inviteRef);

      if (!inviteSnap.exists) {
        throw new Error('NOT_FOUND');
      }

      const invite = inviteSnap.data()!;

      // Idempotent: if Bob already accepted this invite, return ok silently
      if (invite.status === INVITE_STATUS.ACCEPTED && invite.acceptedBy === acceptorId) {
        return;
      }

      if (invite.status !== INVITE_STATUS.PENDING) {
        throw new Error('NOT_FOUND');
      }

      // Prevent self-invite
      if (invite.senderId === acceptorId) {
        throw new Error('INVALID_ARGUMENT');
      }

      // Create bidirectional contacts
      const contactId1 = `${invite.senderId}_${acceptorId}`;
      const contactRef1 = this.db.collection(COLLECTIONS.CONTACTS).doc(contactId1);

      tx.set(contactRef1, {
        ownerId: invite.senderId,
        userId: acceptorId,
        addedAt: FieldValue.serverTimestamp(),
      });

      const contactId2 = `${acceptorId}_${invite.senderId}`;
      const contactRef2 = this.db.collection(COLLECTIONS.CONTACTS).doc(contactId2);

      tx.set(contactRef2, {
        ownerId: acceptorId,
        userId: invite.senderId,
        addedAt: FieldValue.serverTimestamp(),
      });

      tx.update(inviteRef, {
        status: INVITE_STATUS.ACCEPTED,
        acceptedBy: acceptorId,
      });
    });
  }

  async getInvite(token: string) {
    const inviteRef = this.db.collection(COLLECTIONS.INVITES).doc(token);
    const snap = await inviteRef.get();
    if (!snap.exists) return null;
    return snap.data();
  }

  /**
   * Redeems an email invite and creates a contact. Validates expiry.
   */
  async runRedeemEmailInviteTransaction(token: string, acceptorId: string): Promise<void> {
    const inviteRef = this.db.collection(COLLECTIONS.INVITES).doc(token);

    return this.db.runTransaction(async (tx) => {
      const inviteSnap = await tx.get(inviteRef);

      if (!inviteSnap.exists) {
        throw new Error('NOT_FOUND');
      }

      const invite = inviteSnap.data()!;

      // Idempotent: if already accepted by this user, just return silently
      if (invite.status === INVITE_STATUS.ACCEPTED && invite.acceptedBy === acceptorId) {
        return;
      }

      if (invite.status !== INVITE_STATUS.PENDING) {
        throw new Error('INVITE_ALREADY_USED');
      }

      // Check expiry
      if (invite.expiresAt && invite.expiresAt.toDate() < new Date()) {
        throw new Error('INVITE_EXPIRED');
      }

      // Prevent self-invite
      if (invite.senderId === acceptorId) {
        throw new Error('INVALID_ARGUMENT');
      }

      // Create bidirectional contacts
      const contactId1 = `${invite.senderId}_${acceptorId}`;
      const contactRef1 = this.db.collection(COLLECTIONS.CONTACTS).doc(contactId1);

      tx.set(contactRef1, {
        ownerId: invite.senderId,
        userId: acceptorId,
        addedAt: FieldValue.serverTimestamp(),
      });

      const contactId2 = `${acceptorId}_${invite.senderId}`;
      const contactRef2 = this.db.collection(COLLECTIONS.CONTACTS).doc(contactId2);

      tx.set(contactRef2, {
        ownerId: acceptorId,
        userId: invite.senderId,
        addedAt: FieldValue.serverTimestamp(),
      });

      tx.update(inviteRef, {
        status: INVITE_STATUS.ACCEPTED,
        acceptedBy: acceptorId,
      });
    });
  }
}
