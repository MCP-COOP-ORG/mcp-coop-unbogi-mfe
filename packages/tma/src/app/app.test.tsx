import { render, screen } from '@testing-library/react';
import { AUTH_STATUS, type AuthState, useAuthStore } from '@unbogi/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './app';

vi.mock('@unbogi/shared', () => ({
  AUTH_STATUS: {
    AUTHENTICATED: 'AUTHENTICATED',
    UNAUTHENTICATED: 'UNAUTHENTICATED',
    INITIALIZING: 'INITIALIZING',
  },
  useAuthStore: vi.fn(),
}));

vi.mock('@/lib', () => ({
  tg: {
    initData: 'mock_init_data',
    startParam: 'mock_start_param',
  },
}));

vi.mock('@/screens', () => ({
  LoginScreen: () => <div data-testid="login-screen" />,
  MainScreen: () => <div data-testid="main-screen" />,
}));

describe('App', () => {
  const mockInitialize = vi.fn();
  const mockUnsubscribe = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockInitialize.mockReturnValue(mockUnsubscribe);

    // Default mock implementation (UNAUTHENTICATED)
    vi.mocked(useAuthStore).mockImplementation((selector: unknown) => {
      const state = {
        initialize: mockInitialize,
        status: AUTH_STATUS.UNAUTHENTICATED,
      } as unknown as AuthState;
      return (selector as (state: AuthState) => unknown)(state);
    });
  });

  it('initializes auth with telegram data on mount', () => {
    const { unmount } = render(<App />);

    expect(mockInitialize).toHaveBeenCalledWith('mock_init_data', 'mock_start_param');

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('renders LoginScreen when not authenticated', () => {
    render(<App />);

    expect(screen.getByTestId('login-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('main-screen')).not.toBeInTheDocument();
  });

  it('renders MainScreen when authenticated', () => {
    vi.mocked(useAuthStore).mockImplementation((selector: unknown) => {
      const state = {
        initialize: mockInitialize,
        status: AUTH_STATUS.AUTHENTICATED,
      } as unknown as AuthState;
      return (selector as (state: AuthState) => unknown)(state);
    });

    render(<App />);

    expect(screen.getByTestId('main-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('login-screen')).not.toBeInTheDocument();
  });

  it('renders background patterns', () => {
    // We can't easily test the exact inline styles, but we can check if the elements are in the DOM.
    // However, they don't have test IDs or roles. We can verify the outer wrapper has correct classes.
    const { container } = render(<App />);
    const rootDiv = container.firstChild as HTMLElement;

    expect(rootDiv).toHaveClass(
      'relative',
      'flex',
      'flex-col',
      'h-full',
      'w-full',
      'overflow-hidden',
      'bg-purple-500',
      'text-white',
    );
  });
});
