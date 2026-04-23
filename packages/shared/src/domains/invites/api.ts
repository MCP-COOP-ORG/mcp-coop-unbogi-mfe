import { httpsCallable } from 'firebase/functions';
import { CLOUD_FUNCTIONS } from '../../constants';
import { functions } from '../../firebase';

export const invitesApi = {
  async sendEmailInvite(targetEmail: string): Promise<void> {
    const fn = httpsCallable<{ targetEmail: string }, { success: boolean }>(
      functions,
      CLOUD_FUNCTIONS.INVITES_SEND_EMAIL,
    );
    await fn({ targetEmail });
  },

  async redeemEmailInvite(inviteToken: string, initData: string): Promise<{ token: string }> {
    const fn = httpsCallable<{ inviteToken: string; initData: string }, { token: string }>(
      functions,
      CLOUD_FUNCTIONS.INVITES_REDEEM_EMAIL,
    );
    const { data } = await fn({ inviteToken, initData });
    return data;
  },
};
