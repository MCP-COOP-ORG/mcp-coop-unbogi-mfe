import { render, screen } from '@testing-library/react';
import type { GiftRecord } from '@unbogi/shared';
import { describe, expect, it, vi } from 'vitest';

import { GiftCardItem } from './gift-card-item';
import type { GiftScreenStrategy } from './strategies';

// Mock UI components
vi.mock('@/ui', () => ({
  FlipFlap: ({ front, back, disabled }: { front?: React.ReactNode; back?: React.ReactNode; disabled?: boolean }) => (
    <div data-testid="flip-flap" data-disabled={disabled}>
      <div data-testid="front">{front}</div>
      <div data-testid="back">{back}</div>
    </div>
  ),
  GiftBack: ({
    holidayName,
    greeting,
    senderName,
    date,
    code,
  }: {
    holidayName?: React.ReactNode;
    greeting?: React.ReactNode;
    senderName?: React.ReactNode;
    date?: Date;
    code?: { value: string };
  }) => (
    <div data-testid="gift-back">
      {holidayName} {greeting} {senderName} {date ? String(date) : ''} {code?.value}
    </div>
  ),
  Postcard: ({
    imageUrl,
    additionalInfo,
    imageOverlay,
  }: {
    imageUrl?: React.ReactNode;
    additionalInfo?: { from: string; date: Date; id: string };
    imageOverlay?: React.ReactNode;
  }) => (
    <div data-testid="postcard">
      {imageUrl} {additionalInfo?.from} {additionalInfo?.date ? String(additionalInfo.date) : ''} {additionalInfo?.id}
      {imageOverlay}
    </div>
  ),
}));

const mockGift = {
  id: 'gift_1',

  holidayId: 'holiday_1',
  senderName: 'Alice',
  imageUrl: 'https://example.com/image.png',
  greeting: 'Happy Birthday',

  scratchCode: { value: '12345', format: 'code' },
  createdAt: new Date().toISOString(),
} as unknown as GiftRecord;

describe('GiftCardItem', () => {
  it('renders correctly with given strategy', () => {
    const mockStrategy = {
      mode: 'surprises',
      renderOverlays: vi.fn(() => <div data-testid="strategy-overlay" />),
      renderImageOverlay: vi.fn(() => <div data-testid="image-overlay" />),
      selectDate: vi.fn(() => new Date('2026-01-10T00:00:00Z')),
    } as unknown as GiftScreenStrategy;

    render(
      <GiftCardItem
        gift={mockGift}
        strategy={mockStrategy}
        isUnlocked={false}
        isScratched={false}
        onScratched={vi.fn()}
        resolveHoliday={(id) => `Holiday ${id}`}
      />,
    );

    // Strategy calls
    expect(mockStrategy.renderOverlays).toHaveBeenCalled();
    expect(mockStrategy.selectDate).toHaveBeenCalledWith(mockGift);

    // Elements rendered
    expect(screen.getByTestId('strategy-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('flip-flap')).toBeInTheDocument();
    expect(screen.getByTestId('front')).toBeInTheDocument();
    expect(screen.getByTestId('back')).toBeInTheDocument();
    expect(screen.getByTestId('postcard')).toBeInTheDocument();
    expect(screen.getByTestId('gift-back')).toBeInTheDocument();

    // Check specific content
    expect(screen.getByText(/Holiday holiday_1/)).toBeInTheDocument();
    expect(screen.getByText(/Happy Birthday/)).toBeInTheDocument();
    expect(screen.getByText(/12345/)).toBeInTheDocument();
  });

  it('disables flip if mode is surprises and not scratched', () => {
    const mockStrategy = {
      mode: 'surprises',
      renderOverlays: vi.fn(),
      renderImageOverlay: vi.fn(),
      selectDate: vi.fn(),
    } as unknown as GiftScreenStrategy;

    render(
      <GiftCardItem
        gift={mockGift}
        strategy={mockStrategy}
        isUnlocked={true}
        isScratched={false}
        onScratched={vi.fn()}
        resolveHoliday={vi.fn()}
      />,
    );

    expect(screen.getByTestId('flip-flap')).toHaveAttribute('data-disabled', 'true');
  });

  it('enables flip if mode is surprises and scratched', () => {
    const mockStrategy = {
      mode: 'surprises',
      renderOverlays: vi.fn(),
      renderImageOverlay: vi.fn(),
      selectDate: vi.fn(),
    } as unknown as GiftScreenStrategy;

    render(
      <GiftCardItem
        gift={mockGift}
        strategy={mockStrategy}
        isUnlocked={true}
        isScratched={true}
        onScratched={vi.fn()}
        resolveHoliday={vi.fn()}
      />,
    );

    expect(screen.getByTestId('flip-flap')).toHaveAttribute('data-disabled', 'false');
  });

  it('enables flip if mode is collection regardless of scratch state', () => {
    const mockStrategy = {
      mode: 'collection',
      renderOverlays: vi.fn(),
      renderImageOverlay: vi.fn(),
      selectDate: vi.fn(),
    } as unknown as GiftScreenStrategy;

    render(
      <GiftCardItem
        gift={mockGift}
        strategy={mockStrategy}
        isUnlocked={true}
        isScratched={false}
        onScratched={vi.fn()}
        resolveHoliday={vi.fn()}
      />,
    );

    expect(screen.getByTestId('flip-flap')).toHaveAttribute('data-disabled', 'false');
  });
});
