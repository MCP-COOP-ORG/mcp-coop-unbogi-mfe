import { act, fireEvent, render, screen } from '@testing-library/react';
import { invitesApi } from '@unbogi/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useInviteModalStore } from '@/store';
import { InviteModal } from './invite-modal';

// Mock dependencies
vi.mock('@unbogi/shared', () => ({
  isValidEmail: (email: string) => email.includes('@'),
  invitesApi: {
    sendEmailInvite: vi.fn(),
  },
}));

vi.mock('@/hooks', () => ({
  useT: () => ({
    invite: {
      title: 'Invite Title',
      subtitle: 'Invite Subtitle',
      emailRequired: 'Email is required',
      emailInvalid: 'Invalid email',
      errorGeneric: 'Generic error',
      success: 'Success',
      emailPlaceholder: 'Email placeholder',
      close: 'Close',
      cancel: 'Cancel',
      send: 'Send',
    },
  }),
}));

vi.mock('@/lib', () => ({
  ASSETS: {
    BIRD: 'bird.png',
  },
}));

describe('InviteModal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when closed', () => {
    useInviteModalStore.setState({ isInviteModalOpen: false });
    render(<InviteModal />);
    expect(screen.queryByText('Invite Title')).not.toBeInTheDocument();
  });

  it('renders correctly when open', () => {
    useInviteModalStore.setState({ isInviteModalOpen: true });
    render(<InviteModal />);

    expect(screen.getByText('Invite Title')).toBeInTheDocument();
    expect(screen.getByText('Invite Subtitle')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email placeholder')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('shows validation error on blur with invalid email', async () => {
    useInviteModalStore.setState({ isInviteModalOpen: true });
    render(<InviteModal />);

    const input = screen.getByPlaceholderText('Email placeholder');

    fireEvent.change(input, { target: { value: 'invalid' } });
    fireEvent.blur(input);

    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('handles successful submission', async () => {
    vi.mocked(invitesApi.sendEmailInvite).mockResolvedValueOnce({} as never);
    useInviteModalStore.setState({ isInviteModalOpen: true });
    const closeSpy = vi.spyOn(useInviteModalStore.getState(), 'closeInviteModal');

    render(<InviteModal />);

    const input = screen.getByPlaceholderText('Email placeholder');
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Send'));
    });

    expect(invitesApi.sendEmailInvite).toHaveBeenCalledWith('test@example.com');
    expect(screen.getByText('Success')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(closeSpy).toHaveBeenCalled();
  });

  it('handles submission error', async () => {
    vi.mocked(invitesApi.sendEmailInvite).mockRejectedValueOnce(new Error('API Error'));
    useInviteModalStore.setState({ isInviteModalOpen: true });

    render(<InviteModal />);

    const input = screen.getByPlaceholderText('Email placeholder');
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Send'));
    });

    expect(screen.getByText('API Error')).toBeInTheDocument();
  });

  it('handles close button', async () => {
    useInviteModalStore.setState({ isInviteModalOpen: true });
    const closeSpy = vi.spyOn(useInviteModalStore.getState(), 'closeInviteModal');

    render(<InviteModal />);

    await act(async () => {
      screen.getByText('Cancel').click();
    });

    expect(closeSpy).toHaveBeenCalled();
  });
});
