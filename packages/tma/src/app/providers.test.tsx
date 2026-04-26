import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { tg } from '@/lib';
import { Providers } from './providers';

vi.mock('@/lib', () => ({
  tg: {
    ready: vi.fn(),
    expand: vi.fn(),
  },
}));

describe('Providers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes Telegram WebApp SDK on mount', () => {
    render(
      <Providers>
        <div>Test</div>
      </Providers>,
    );

    expect(tg.ready).toHaveBeenCalled();
    expect(tg.expand).toHaveBeenCalled();
  });

  it('sets --locked-app-height CSS variable on mount', () => {
    // Mock window.innerHeight
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });

    const setPropertySpy = vi.spyOn(document.documentElement.style, 'setProperty');

    render(
      <Providers>
        <div>Test</div>
      </Providers>,
    );

    expect(setPropertySpy).toHaveBeenCalledWith('--locked-app-height', '800px');
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <Providers>
        <div data-testid="child">Hello World</div>
      </Providers>,
    );

    expect(getByText('Hello World')).toBeInTheDocument();
  });
});
