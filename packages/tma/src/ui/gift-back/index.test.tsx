import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GiftBack } from './index';

vi.mock('@/hooks', () => ({
  useT: () => ({
    giftBack: {
      activationCode: 'Activation code',
      scanToActivate: 'Scan to activate',
      copied: 'Copied!',
      tapToCopy: 'Tap to copy',
    },
  }),
}));

const mockHaptic = vi.fn();
vi.mock('@/lib', () => ({
  tg: {
    hapticNotification: (...args: unknown[]) => mockHaptic(...args),
  },
  formatLocalDate: (d: Date) => d.toISOString(),
}));

describe('GiftBack', () => {
  beforeEach(() => {
    mockHaptic.mockClear();
    vi.useFakeTimers();
    // mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  const defaultProps = {
    holidayName: 'Happy Birthday',
    greeting: 'Have a great day!',
    senderName: 'Alice',
    date: new Date('2026-01-01T00:00:00.000Z'),
  };

  it('renders holiday title, greeting, and sender', () => {
    render(<GiftBack {...defaultProps} code={{ value: 'ABC', format: 'code' }} />);

    expect(screen.getByText('Happy Birthday')).toBeInTheDocument();
    expect(screen.getByText('Have a great day!')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('2026-01-01T00:00:00.000Z')).toBeInTheDocument();
  });

  it('renders alphanumeric code and handles copy success', async () => {
    render(<GiftBack {...defaultProps} code={{ value: 'ABC-123', format: 'code' }} />);

    expect(screen.getByText('Activation code')).toBeInTheDocument();
    expect(screen.getByText('Tap to copy')).toBeInTheDocument();

    const copyButton = screen.getByRole('button', { name: 'ABC-123' });

    await act(async () => {
      fireEvent.click(copyButton);
      // Wait for the Promise in handleCopy to resolve
      await Promise.resolve();
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ABC-123');
    expect(mockHaptic).toHaveBeenCalledWith('success');
    expect(screen.getByText('Copied!')).toBeInTheDocument();

    // Advance the 2000ms timeout
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
    expect(screen.getByText('ABC-123')).toBeInTheDocument();
  });

  it('renders qr-code', () => {
    const { container } = render(
      <GiftBack {...defaultProps} code={{ value: 'https://example.com/qr', format: 'qr-code' }} />,
    );

    expect(screen.getByText('Activation code')).toBeInTheDocument();
    expect(screen.getByText('Scan to activate')).toBeInTheDocument();

    // Check if SVG is rendered (from QRCodeSVG)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('handles copy failure', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.reject(new Error('fail'))),
      },
    });

    render(<GiftBack {...defaultProps} code={{ value: 'ABC-123', format: 'code' }} />);
    const copyButton = screen.getByRole('button', { name: 'ABC-123' });

    await act(async () => {
      fireEvent.click(copyButton);
      await Promise.resolve(); // flush promises
    });

    expect(mockHaptic).toHaveBeenCalledWith('error');
    // Copied text shouldn't show
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
  });
});
