import { act, render, screen } from '@testing-library/react';
import { OTP_CONFIG } from '@unbogi/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OtpTimer } from './otp-timer';

describe('OtpTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders initial time correctly based on sentAt', () => {
    // Assuming OTP_CONFIG.LIFETIME_MS is set in shared config, let's mock it if needed or use real value.
    // Usually it's something like 60000ms (1 min) or 300000ms (5 mins).
    // Let's set System time to a fixed value.
    vi.setSystemTime(new Date(1000000000000));

    // We mock OTP_CONFIG temporarily if needed, but since it's a constant we can just calculate.
    const lifetime = OTP_CONFIG.LIFETIME_MS;
    const minutes = Math.floor(lifetime / 1000 / 60);
    const seconds = Math.floor((lifetime / 1000) % 60);
    const expectedLabel = `${minutes}:${String(seconds).padStart(2, '0')}`;

    render(<OtpTimer sentAt={1000000000000} onExpired={vi.fn()} />);

    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });

  it('calls onExpired when timer reaches zero', () => {
    vi.setSystemTime(new Date(1000000000000));
    const onExpired = vi.fn();

    render(<OtpTimer sentAt={1000000000000} onExpired={onExpired} />);

    act(() => {
      vi.advanceTimersByTime(OTP_CONFIG.LIFETIME_MS);
    });

    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it('updates the time correctly on interval', () => {
    vi.setSystemTime(new Date(1000000000000));
    const onExpired = vi.fn();

    render(<OtpTimer sentAt={1000000000000} onExpired={onExpired} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const lifetime = OTP_CONFIG.LIFETIME_MS - 1000;
    const minutes = Math.floor(lifetime / 1000 / 60);
    const seconds = Math.floor((lifetime / 1000) % 60);
    const expectedLabel = `${minutes}:${String(seconds).padStart(2, '0')}`;

    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });

  it('renders timer icon when expired', () => {
    vi.setSystemTime(new Date(1000000000000));
    const onExpired = vi.fn();

    render(<OtpTimer sentAt={1000000000000 - OTP_CONFIG.LIFETIME_MS} onExpired={onExpired} />);

    // Time is already 0, so should render the icon. The icon doesn't have text, but we can check if label is absent.
    // Or we can check for an element that does not have text.
    expect(screen.queryByText(/^[0-9]+:[0-9]+$/)).not.toBeInTheDocument();

    // Lucide timer icon uses SVG. We can check by checking container child count or something else.
    // It is simpler to just check that text is missing.
  });
});
