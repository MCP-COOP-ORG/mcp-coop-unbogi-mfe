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

      // Deterministic contact ID: sender_acceptor
      const contactId = `${invite.senderId}_${acceptorId}`;
      const contactRef = this.db.collection(COLLECTIONS.CONTACTS).doc(contactId);

      tx.set(contactRef, {
        ownerId: invite.senderId,
        userId: acceptorId,
        addedAt: FieldValue.serverTimestamp(),
      });

      tx.update(inviteRef, {
        status: INVITE_STATUS.ACCEPTED,
        acceptedBy: acceptorId,
      });
    });
  }
}
