import {
  type AcceptInvitePayload,
  CONFIG,
  type CreateInvitePayload,
  EMAILS,
  ERROR_CODES,
  ERROR_MESSAGES,
  FIREBASE_ERRORS,
  PROVIDERS,
  type RedeemEmailInvitePayload,
  type SendEmailInvitePayload,
} from '@unbogi/contracts';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { type FunctionsErrorCode, HttpsError } from 'firebase-functions/v2/https';
import { Resend } from 'resend';
import { InviteRepository } from '../repositories/invite';
import { UserRepository } from '../repositories/user';
import { isFirebaseError } from '../utils/errors';
import { AuthService } from './auth';

export class InviteService {
  private repository = new InviteRepository();
  private userRepository = new UserRepository();
  private authService = new AuthService(this.userRepository);

  /**
   * Creates a new invite and returns the token
   */
  async createInvite(senderId: string, _payload: CreateInvitePayload): Promise<{ token: string }> {
    const token = await this.repository.createInvite(senderId);
    return { token };
  }

  /**
   * Accepts an invite and creates a contact entry
   */
  async acceptInvite(acceptorId: string, payload: AcceptInvitePayload): Promise<{ success: boolean }> {
    await this.repository.runAcceptInviteTransaction(payload.token, acceptorId);
    return { success: true };
  }

  /**
   * Generates a 48h invite token and sends it via email
   */
  async sendEmailInvite(
    senderId: string,
    payload: SendEmailInvitePayload,
    botUsername: string,
    resendApiKey: string,
  ): Promise<{ success: boolean }> {
    const { targetEmail } = payload;

    // Get sender nickname
    const sender = await this.userRepository.findById(senderId);
    const senderName = sender?.nickname || 'A user';

    // Create invite in DB
    const token = await this.repository.createEmailInvite(senderId, targetEmail, CONFIG.INVITE_LIFETIME_MS);

    // Send email
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: EMAILS.SENDER,
      to: targetEmail,
      subject: EMAILS.SUBJECT_INVITE,
      html: EMAILS.TEMPLATE_INVITE(senderName, botUsername, token),
    });

    if (error) {
      logger.error('Resend API Error:', error);
      throw new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, ERROR_MESSAGES.FAILED_TO_SEND_EMAIL);
    }

    return { success: true };
  }

  /**
   * Redeems an email invite token via Telegram initData and issues a Firebase Custom Token
   */
  async redeemEmailInvite(payload: RedeemEmailInvitePayload, botToken: string): Promise<{ token: string }> {
    const { inviteToken, initData } = payload;

    // 1. Verify Telegram signature and extract user
    const tgUser = this.authService.validateAndExtractUser(initData, botToken);
    const nickname = tgUser.username || tgUser.first_name || 'User';

    try {
      // 2. Redeem invite in DB (validates expiry and idempotency)
      const targetEmail = await this.repository.runRedeemEmailInviteTransaction(inviteToken, String(tgUser.id));

      // 3. Get or create Firebase User
      let userRecord: admin.auth.UserRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(targetEmail);
      } catch (err: unknown) {
        if (isFirebaseError(err) && err.code === FIREBASE_ERRORS.USER_NOT_FOUND) {
          try {
            userRecord = await admin.auth().createUser({ email: targetEmail });
          } catch (createErr) {
            logger.error('[redeemEmailInvite] Error creating user:', createErr);
            throw new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, ERROR_MESSAGES.AUTH_SYSTEM_ERROR);
          }
        } else {
          logger.error('[redeemEmailInvite] Error getting user by email:', err);
          throw new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, ERROR_MESSAGES.AUTH_SYSTEM_ERROR);
        }
      }

      const uid = userRecord.uid;

      // 4. Upsert user profile to bind Telegram ID and Email
      await this.userRepository.upsertUser(uid, {
        uid,
        email: targetEmail,
        telegramId: tgUser.id,
        nickname,
        provider: PROVIDERS.EMAIL,
      });

      // 5. Generate Custom Token
      const customToken = await admin.auth().createCustomToken(uid);
      return { token: customToken };
    } catch (err: unknown) {
      logger.error('[redeemEmailInvite] Error:', err);
      if (err instanceof Error) {
        // Map Repository errors to HttpsError
        const code =
          err.message === 'INVITE_EXPIRED' || err.message === 'INVITE_ALREADY_USED'
            ? ERROR_CODES.INVALID_ARGUMENT
            : ERROR_CODES.INTERNAL;
        throw new HttpsError(code as FunctionsErrorCode, err.message);
      }
      throw new HttpsError(ERROR_CODES.INTERNAL as FunctionsErrorCode, ERROR_MESSAGES.AUTH_SYSTEM_ERROR);
    }
  }
}
