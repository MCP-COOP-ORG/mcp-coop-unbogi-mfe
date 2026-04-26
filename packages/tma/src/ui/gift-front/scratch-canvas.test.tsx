import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as hooks from '@/hooks';
import { ScratchCanvas } from './scratch-canvas';

vi.mock('@/hooks', () => ({
  useScratchGesture: vi.fn(),
}));

describe('ScratchCanvas', () => {
  let mockContext: Partial<CanvasRenderingContext2D>;

  beforeEach(() => {
    mockContext = {
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      scale: vi.fn(),
      fillText: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      createImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(128 * 128 * 4),
      })) as unknown as CanvasRenderingContext2D['createImageData'],
      putImageData: vi.fn(),
    };

    // Mock canvas context
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => mockContext,
    ) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    vi.spyOn(hooks, 'useScratchGesture').mockReturnValue({
      canvasRef: { current: document.createElement('canvas') } as unknown as React.RefObject<HTMLCanvasElement | null>,
      revealedRef: { current: false } as unknown as React.MutableRefObject<boolean>,
    });
  });

  it('renders canvas element', () => {
    const { container } = render(<ScratchCanvas />);

    // Test that the wrapper and canvas render without crashing
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('calls onReveal when the scratch gesture hook triggers it', () => {
    let internalOnReveal: (() => void) | undefined;

    vi.spyOn(hooks, 'useScratchGesture').mockImplementation(({ onReveal }: hooks.ScratchGestureOptions) => {
      internalOnReveal = onReveal;
      return {
        canvasRef: {
          current: document.createElement('canvas'),
        } as unknown as React.RefObject<HTMLCanvasElement | null>,
        revealedRef: { current: false } as unknown as React.MutableRefObject<boolean>,
      };
    });

    const onRevealMock = vi.fn();
    render(<ScratchCanvas onReveal={onRevealMock} />);

    expect(internalOnReveal).toBeDefined();
    if (internalOnReveal) {
      act(() => {
        internalOnReveal!();
      });
    }

    expect(onRevealMock).toHaveBeenCalled();
  });

  it('handles image loading gracefully', () => {
    // Override the Image constructor to instantly trigger onload on src setter
    const originalImage = global.Image;
    global.Image = class {
      onload: (() => void) | null = null;
      _src = '';
      set src(val: string) {
        this._src = val;
        if (this.onload) this.onload();
      }
      get src() {
        return this._src;
      }
      naturalWidth = 100;
      complete = true;
    } as unknown as typeof Image;

    render(<ScratchCanvas imageUrl="test.jpg" logoUrl="logo.png" isUnlocked={true} />);

    // Since we mock context, it will try to draw, ensuring it does not crash
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();

    // restore
    global.Image = originalImage;
  });

  it('applies unlocked state properly', () => {
    const { rerender } = render(<ScratchCanvas isUnlocked={false} />);
    rerender(<ScratchCanvas isUnlocked={true} />);

    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
  });
});
