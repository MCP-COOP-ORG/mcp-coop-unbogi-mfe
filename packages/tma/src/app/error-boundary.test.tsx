import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from './error-boundary';

vi.mock('@/lib', () => ({
  ASSETS: { LOGO: 'test-logo.png' },
}));

vi.mock('@/ui', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
  Button: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button type="button" data-testid="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

import type React from 'react';

const mockT = {
  error: {
    title: 'Oops, something broke',
    description: 'An unexpected error occurred. Reloading usually fixes it.',
    reload: 'Reload App',
  },
} as React.ComponentProps<typeof ErrorBoundary>['t'];

function BrokenChild(): React.ReactNode {
  throw new Error('Test crash');
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary t={mockT}>
        <p>Working</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Working')).toBeInTheDocument();
  });

  it('renders fallback on error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary t={mockT}>
        <BrokenChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Oops, something broke')).toBeInTheDocument();
    expect(screen.getByText('Reload App')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('reloads page when retry button clicked', async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    });

    render(
      <ErrorBoundary t={mockT}>
        <BrokenChild />
      </ErrorBoundary>,
    );

    await user.click(screen.getByText('Reload App'));
    expect(reloadMock).toHaveBeenCalled();
    spy.mockRestore();
  });
});
