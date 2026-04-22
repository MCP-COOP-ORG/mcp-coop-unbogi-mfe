import { InviteRepository } from "../repositories/invite";
import { CreateInvitePayload, AcceptInvitePayload } from "@unbogi/contracts";

export class InviteService {
  private repository = new InviteRepository();

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
}
