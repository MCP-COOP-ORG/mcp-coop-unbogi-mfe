import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LockOverlay } from './lock-overlay';

vi.mock('@/hooks', () => ({
  useT: () => ({
    surprises: {
      fromSender: 'From {{name}}',
      canBeUnpacked: 'Unlocks on {{date}}',
    },
  }),
}));

describe('LockOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders countdown and information when lockedUntil is in the future', () => {
    const futureDate = new Date(Date.now() + 3600000); // 1 hour ahead

    render(<LockOverlay lockedUntil={futureDate} senderName="Alice" />);

    expect(screen.getByText('From Alice')).toBeInTheDocument();
    expect(screen.getByText(/Unlocks on/)).toBeInTheDocument();

    // Time format for 1 hour is "01:00:00"
    expect(screen.getByText('01:00:00')).toBeInTheDocument();
  });

  it('does not render when lockedUntil is in the past', () => {
    const pastDate = new Date(Date.now() - 3600000); // 1 hour ago

    const { container } = render(<LockOverlay lockedUntil={pastDate} senderName="Alice" />);

    expect(container).toBeEmptyDOMElement();
  });

  it('updates countdown over time', () => {
    const futureDate = new Date(Date.now() + 5000); // 5 seconds ahead

    render(<LockOverlay lockedUntil={futureDate} />);

    expect(screen.getByText('00:05')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('00:03')).toBeInTheDocument();
  });

  it('renders without sender name correctly', () => {
    const futureDate = new Date(Date.now() + 3600000); // 1 hour ahead

    render(<LockOverlay lockedUntil={futureDate} />);

    expect(screen.queryByText(/From/)).not.toBeInTheDocument();
    expect(screen.getByText(/Unlocks on/)).toBeInTheDocument();
  });
});
