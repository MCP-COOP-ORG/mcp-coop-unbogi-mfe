import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SCREENS, useGiftModeStore, useInviteModalStore, useNavigationStore } from '@/store';
import { collectionStrategy, surprisesStrategy } from './components/strategies';
import { MainScreen } from './index';

vi.mock('@/store', () => ({
  SCREENS: {
    SEND: 'SEND',
    MAIN: 'MAIN',
  },
  useNavigationStore: vi.fn(),
  useGiftModeStore: vi.fn(),
  useInviteModalStore: vi.fn(),
}));

vi.mock('./components', () => ({
  GiftCarousel: () => <div data-testid="gift-carousel" />,
  InviteModal: () => <div data-testid="invite-modal" />,
  SendForm: () => <div data-testid="send-form" />,
}));

vi.mock('@/ui', () => ({
  BottomNav: ({
    tabs,
    activeTabId,
    onTabChange,
    onInviteClick,
    onSendClick,
  }: {
    tabs: { id: string; label: string; strategy: unknown }[];
    activeTabId: string;
    onTabChange: (s: unknown) => void;
    onInviteClick: () => void;
    onSendClick: () => void;
  }) => (
    <div data-testid="bottom-nav">
      <button type="button" data-testid="nav-invite" onClick={onInviteClick}>
        Invite
      </button>
      <button type="button" data-testid="nav-send" onClick={onSendClick}>
        Send
      </button>
      <div data-testid="nav-tabs">
        {tabs.map((tab: { id: string; label: string; strategy: unknown }) => (
          <button type="button" key={tab.id} data-testid={`tab-${tab.id}`} onClick={() => onTabChange(tab.strategy)}>
            {tab.label}
          </button>
        ))}
      </div>
      <span data-testid="active-tab">{activeTabId}</span>
    </div>
  ),
}));

describe('MainScreen', () => {
  const mockSetScreen = vi.fn();
  const mockSetStrategy = vi.fn();
  const mockOpenInviteModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useNavigationStore).mockImplementation((selector) =>
      selector({ activeScreen: SCREENS.MAIN, setScreen: mockSetScreen }),
    );

    vi.mocked(useGiftModeStore).mockImplementation((selector) =>
      selector({ strategy: surprisesStrategy, setStrategy: mockSetStrategy }),
    );

    vi.mocked(useInviteModalStore).mockImplementation((selector) =>
      selector({
        openInviteModal: mockOpenInviteModal,
        isInviteModalOpen: false,
        closeInviteModal: vi.fn(),
      }),
    );
  });

  it('renders correctly with default state', () => {
    render(<MainScreen />);

    expect(screen.getByTestId('gift-carousel')).toBeInTheDocument();
    expect(screen.getByTestId('invite-modal')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();

    // Send form should not be rendered
    expect(screen.queryByTestId('send-form')).not.toBeInTheDocument();
  });

  it('renders SendForm when activeScreen is SEND', () => {
    vi.mocked(useNavigationStore).mockImplementation((selector) =>
      selector({ activeScreen: SCREENS.SEND, setScreen: mockSetScreen }),
    );

    render(<MainScreen />);

    expect(screen.getByTestId('send-form')).toBeInTheDocument();
  });

  it('handles tab changes', () => {
    render(<MainScreen />);

    const collectionTab = screen.getByTestId(`tab-${collectionStrategy.mode}`);
    fireEvent.click(collectionTab);

    expect(mockSetStrategy).toHaveBeenCalledWith(collectionStrategy);
  });

  it('handles invite click', () => {
    render(<MainScreen />);

    fireEvent.click(screen.getByTestId('nav-invite'));

    expect(mockOpenInviteModal).toHaveBeenCalled();
  });

  it('handles send click', () => {
    render(<MainScreen />);

    fireEvent.click(screen.getByTestId('nav-send'));

    expect(mockSetScreen).toHaveBeenCalledWith(SCREENS.SEND);
  });
});
