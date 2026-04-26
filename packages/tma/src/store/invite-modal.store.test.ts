import { beforeEach, describe, expect, it } from 'vitest';
import { useInviteModalStore } from './invite-modal.store';

describe('invite-modal.store', () => {
  beforeEach(() => {
    // Reset state before each test
    useInviteModalStore.setState({ isInviteModalOpen: false });
  });

  it('should initialize with isInviteModalOpen false', () => {
    expect(useInviteModalStore.getState().isInviteModalOpen).toBe(false);
  });

  it('should open modal', () => {
    useInviteModalStore.getState().openInviteModal();
    expect(useInviteModalStore.getState().isInviteModalOpen).toBe(true);
  });

  it('should close modal', () => {
    useInviteModalStore.setState({ isInviteModalOpen: true });
    useInviteModalStore.getState().closeInviteModal();
    expect(useInviteModalStore.getState().isInviteModalOpen).toBe(false);
  });
});
