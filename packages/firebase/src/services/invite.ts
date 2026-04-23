import {
  type AcceptInvitePayload,
  CONFIG,
  type CreateInvitePayload,
  EMAILS,
  ERROR_CODES,
  ERROR_MESSAGES,
  PROVIDERS,
  type RedeemEmailInvitePayload,
  type SendEmailInvitePayload,
} from '@unbogi/contracts';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { type FunctionsErrorCode, HttpsError } from 'firebase-functions/v2/https';
import { Resend } from 'resend';
import type { InviteRepository } from '../repositories/invite';
import type { UserRepository } from '../repositories/user';
import { getOrCreateFirebaseUser } from '../utils/firebase-auth';
import type { AuthService } from './auth';

export class InviteService {
  constructor(
    private readonly repository: InviteRepository,
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  /** Creates a new invite link and returns the token. */
  async createInvite(senderId: string, _payload: CreateInvitePayload): Promise<{ token: string }> {
    const token = await this.repository.createInvite(senderId);
    return { token };
  }

  /** Accepts a link-based invite and establishes bidirectional contacts. */
  async acceptInvite(acceptorId: string, payload: AcceptInvitePayload): Promise<{ success: boolean }> {
    await this.repository.runAcceptInviteTransaction(payload.token, acceptorId);
    return { success: true };
  }

  /**
   * Generates a 48-hour invite token and delivers it via email.
   * Resolves the sender's nickname for personalisation.
   */
  async sendEmailInvite(
    senderId: string,
    payload: SendEmailInvitePayload,
    botUsername: string,
    resendApiKey: string,
  ): Promise<{ success: boolean }> {
    const { targetEmail } = payload;

    const sender = await this.userRepository.findById(senderId);
    const senderName = sender?.nickname ?? 'A user';

    const token = await this.repository.createEmailInvite(senderId, targetEmail, CONFIG.INVITE_LIFETIME_MS);

    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: EMAILS.SENDER,
      to: targetEmail,
      subject: EMAILS.SUBJECT_INVITE,
      html: EMAILS.TEMPLATE_INVITE(senderName, botUsername, token),
    });

    if (error) {
      logger.error('[InviteService.sendEmailInvite] Resend API Error:', error);
      throw new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, ERROR_MESSAGES.FAILED_TO_SEND_EMAIL);
    }

    return { success: true };
  }

  /**
   * Redeems an email invite via Telegram `initData` and issues a Firebase Custom Token.
   * Steps: verify TG signature → get/create Firebase user → upsert profile → redeem invite → issue token.
   */
  async redeemEmailInvite(payload: RedeemEmailInvitePayload, botToken: string): Promise<{ token: string }> {
    const { inviteToken, initData } = payload;

    const tgUser = this.authService.validateAndExtractUser(initData, botToken);
    const nickname = tgUser.username || tgUser.first_name || 'User';

    const inviteData = await this.repository.getInvite(inviteToken);
    if (!inviteData) {
      throw new HttpsError(ERROR_CODES.NOT_FOUND as FunctionsErrorCode, 'Invite not found');
    }

    const { targetEmail } = inviteData;

    // Shared utility: get existing Firebase Auth user or create one
    const userRecord = await getOrCreateFirebaseUser(targetEmail);
    const uid = userRecord.uid;

    await this.userRepository.upsertUser(uid, {
      uid,
      email: targetEmail,
      telegramId: tgUser.id,
      nickname,
      provider: PROVIDERS.EMAIL,
    });

    // Validates expiry and idempotency internally
    await this.repository.runRedeemEmailInviteTransaction(inviteToken, uid);

    const customToken = await admin.auth().createCustomToken(uid);
    return { token: customToken };
  }
}
