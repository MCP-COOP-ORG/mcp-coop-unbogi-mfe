import { act, render, screen } from '@testing-library/react';
import { type GiftRecord, type Holiday, useGiftsStore, useHolidaysStore } from '@unbogi/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useGiftModeStore } from '@/store';
import { GiftCarousel } from './gift-carousel';

// Mock UI components
vi.mock('@/ui', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
  Slider: ({ items, renderItem }: { items: unknown[]; renderItem: (item: unknown) => React.ReactNode }) => (
    <div data-testid="slider">{items.map((item: unknown) => renderItem(item))}</div>
  ),
}));

// Mock GiftCardItem
vi.mock('./gift-card-item', () => ({
  GiftCardItem: ({
    gift,
    isUnlocked,
    isScratched,
    onScratched,
    resolveHoliday,
  }: {
    gift: GiftRecord;
    isUnlocked: boolean;
    isScratched: boolean;
    onScratched: (id: string) => void;
    resolveHoliday: (id: string) => string;
  }) => (
    <div data-testid={`gift-item-${gift.id}`}>
      Unlocked: {String(isUnlocked)}
      Scratched: {String(isScratched)}
      Holiday: {resolveHoliday(gift.holidayId)}
      <button type="button" onClick={() => onScratched(gift.id)}>
        Scratch
      </button>
    </div>
  ),
}));

// Mock Hooks
vi.mock('@/hooks', () => ({
  useT: () => ({
    emptySurprises: 'No surprises yet',
    emptyCollection: 'No gifts yet',
  }),
}));

vi.mock('@/lib', () => ({
  ASSETS: {
    LOGO: 'mock-logo.png',
  },
}));

describe('GiftCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders loading state initially', () => {
    useGiftsStore.setState({ isLoaded: false, isLoading: true });
    useHolidaysStore.setState({ holidays: [] });
    useGiftModeStore.setState({
      strategy: {
        mode: 'surprises',
        selectGifts: () => [],
        emptyLabel: (t: Record<string, string>) => t.emptySurprises,
        requiresTimer: true,
      } as unknown as ReturnType<typeof useGiftModeStore.getState>['strategy'],
    });

    render(<GiftCarousel />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders empty state when no gifts', () => {
    useGiftsStore.setState({ isLoaded: true, isLoading: false, receivedGifts: [], openedGifts: [] });
    useHolidaysStore.setState({ holidays: [] });
    useGiftModeStore.setState({
      strategy: {
        mode: 'surprises',
        selectGifts: () => [],
        emptyLabel: (t: Record<string, string>) => t.emptySurprises,
        requiresTimer: true,
      } as unknown as ReturnType<typeof useGiftModeStore.getState>['strategy'],
    });

    render(<GiftCarousel />);
    expect(screen.getByText('No surprises yet')).toBeInTheDocument();
  });

  it('renders slider with gifts and resolves holiday', () => {
    const mockGift = {
      id: 'g1',
      holidayId: 'h1',
      unpackDate: new Date(Date.now() + 10000).toISOString(),
    };

    useGiftsStore.setState({
      isLoaded: true,
      isLoading: false,
      receivedGifts: [mockGift as unknown as GiftRecord],
      openedGifts: [],
      scratchGift: vi.fn(),
    });

    useHolidaysStore.setState({
      holidays: [{ id: 'h1', name: 'New Year', date: '' } as unknown as Holiday],
    });

    useGiftModeStore.setState({
      strategy: {
        mode: 'surprises',
        selectGifts: () => [mockGift as unknown as GiftRecord],
        emptyLabel: (t: Record<string, string>) => t.emptySurprises,
        requiresTimer: true,
      } as unknown as ReturnType<typeof useGiftModeStore.getState>['strategy'],
    });

    render(<GiftCarousel />);

    expect(screen.getByTestId('slider')).toBeInTheDocument();
    expect(screen.getByTestId('gift-item-g1')).toBeInTheDocument();
    expect(screen.getByText(/Holiday: New Year/)).toBeInTheDocument();
    expect(screen.getByText(/Unlocked: false/)).toBeInTheDocument();
    expect(screen.getByText(/Scratched: false/)).toBeInTheDocument();
  });

  it('updates unlocked state over time', () => {
    const now = Date.now();
    const mockGift = {
      id: 'g1',
      holidayId: 'h1',
      unpackDate: new Date(now + 1000).toISOString(), // Unlocks in 1 second
    };

    useGiftsStore.setState({
      isLoaded: true,
      isLoading: false,
      receivedGifts: [mockGift as unknown as GiftRecord],
      openedGifts: [],
    });

    useGiftModeStore.setState({
      strategy: {
        mode: 'surprises',
        selectGifts: () => [mockGift as unknown as GiftRecord],
        emptyLabel: (t: Record<string, string>) => t.emptySurprises,
        requiresTimer: true,
      } as unknown as ReturnType<typeof useGiftModeStore.getState>['strategy'],
    });

    render(<GiftCarousel />);

    expect(screen.getByText(/Unlocked: false/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText(/Unlocked: true/)).toBeInTheDocument();
  });

  it('handles onScratched callback', () => {
    const mockGift = {
      id: 'g1',
      holidayId: 'h1',
      unpackDate: new Date(Date.now() - 1000).toISOString(),
    };

    const mockScratchGift = vi.fn();

    useGiftsStore.setState({
      isLoaded: true,
      isLoading: false,
      receivedGifts: [mockGift as unknown as GiftRecord],
      openedGifts: [],
      scratchGift: mockScratchGift,
    });

    useGiftModeStore.setState({
      strategy: {
        mode: 'surprises',
        selectGifts: () => [mockGift as unknown as GiftRecord],
        emptyLabel: (t: Record<string, string>) => t.emptySurprises,
        requiresTimer: true,
      } as unknown as ReturnType<typeof useGiftModeStore.getState>['strategy'],
    });

    render(<GiftCarousel />);

    expect(screen.getByText(/Scratched: false/)).toBeInTheDocument();

    act(() => {
      screen.getByText('Scratch').click();
    });

    expect(mockScratchGift).toHaveBeenCalledWith('g1');
    expect(screen.getByText(/Scratched: true/)).toBeInTheDocument();
  });
});
