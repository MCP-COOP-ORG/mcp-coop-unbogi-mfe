import { COLLECTIONS, INVITE_STATUS } from '@unbogi/contracts';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { AppError } from '../utils/errors';

export class InviteRepository {
  private get db() {
    return admin.firestore();
  }

  private get collection() {
    return this.db.collection(COLLECTIONS.INVITES);
  }

  /** Creates a new pending invite document. */
  async createInvite(senderId: string): Promise<string> {
    const inviteRef = this.collection.doc();
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

  /** Creates a pending email invite document with an expiration timestamp. */
  async createEmailInvite(senderId: string, targetEmail: string, expiresInMs: number): Promise<string> {
    const inviteRef = this.collection.doc();
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

  /** Returns raw invite data or `null` if the document does not exist. */
  async getInvite(token: string) {
    const snap = await this.collection.doc(token).get();
    if (!snap.exists) return null;
    return snap.data();
  }

  /**
   * Marks a link-based invite as ACCEPTED and creates bidirectional contacts.
   * Idempotent: silently succeeds if the same acceptor already accepted.
   */
  async runAcceptInviteTransaction(token: string, acceptorId: string): Promise<void> {
    const inviteRef = this.collection.doc(token);

    await this.db.runTransaction(async (tx) => {
      const inviteSnap = await tx.get(inviteRef);

      if (!inviteSnap.exists) throw new AppError('not-found', 'Invite not found');

      const invite = inviteSnap.data()!;

      // Idempotent: already accepted by this acceptor → return silently
      if (invite.status === INVITE_STATUS.ACCEPTED && invite.acceptedBy === acceptorId) return;

      if (invite.status !== INVITE_STATUS.PENDING) {
        throw new AppError('not-found', 'Invite not found or already accepted');
      }

      if (invite.senderId === acceptorId) {
        throw new AppError('invalid-argument', 'Cannot accept your own invite');
      }

      this.createBidirectionalContacts(tx, invite.senderId, acceptorId);

      tx.update(inviteRef, { status: INVITE_STATUS.ACCEPTED, acceptedBy: acceptorId });
    });
  }

  /**
   * Redeems an email invite: validates expiry, creates contacts, marks as ACCEPTED.
   * Idempotent: silently succeeds if the same acceptor already redeemed.
   */
  async runRedeemEmailInviteTransaction(token: string, acceptorId: string): Promise<void> {
    const inviteRef = this.collection.doc(token);

    await this.db.runTransaction(async (tx) => {
      const inviteSnap = await tx.get(inviteRef);

      if (!inviteSnap.exists) throw new AppError('not-found', 'Invite not found');

      const invite = inviteSnap.data()!;

      // Idempotent: already accepted by this acceptor → return silently
      if (invite.status === INVITE_STATUS.ACCEPTED && invite.acceptedBy === acceptorId) return;

      if (invite.status !== INVITE_STATUS.PENDING) {
        throw new AppError('invalid-argument', 'INVITE_ALREADY_USED');
      }

      if (invite.expiresAt && invite.expiresAt.toDate() < new Date()) {
        throw new AppError('invalid-argument', 'INVITE_EXPIRED');
      }

      if (invite.senderId === acceptorId) {
        throw new AppError('invalid-argument', 'Cannot accept your own invite');
      }

      this.createBidirectionalContacts(tx, invite.senderId, acceptorId);

      tx.update(inviteRef, { status: INVITE_STATUS.ACCEPTED, acceptedBy: acceptorId });
    });
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  /**
   * Enqueues two symmetric contact documents within an active transaction.
   * Deterministic IDs (`a_b` / `b_a`) prevent duplicate contacts between the same pair.
   */
  private createBidirectionalContacts(tx: FirebaseFirestore.Transaction, userId1: string, userId2: string): void {
    const contacts = this.db.collection(COLLECTIONS.CONTACTS);

    tx.set(contacts.doc(`${userId1}_${userId2}`), {
      ownerId: userId1,
      userId: userId2,
      addedAt: FieldValue.serverTimestamp(),
    });

    tx.set(contacts.doc(`${userId2}_${userId1}`), {
      ownerId: userId2,
      userId: userId1,
      addedAt: FieldValue.serverTimestamp(),
    });
  }
}
