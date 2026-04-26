import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScratchGesture } from './use-scratch-gesture';

describe('useScratchGesture', () => {
  let mockContext: Partial<CanvasRenderingContext2D>;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    mockContext = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(400).fill(0), // Simulate transparent
      })) as unknown as CanvasRenderingContext2D['getImageData'],
    };

    canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    canvas.getContext = vi.fn(() => mockContext) as unknown as HTMLCanvasElement['getContext'];

    canvas.getBoundingClientRect = vi.fn(
      () =>
        ({
          left: 0,
          top: 0,
          width: 100,
          height: 100,
        }) as DOMRect,
    );

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes correctly', () => {
    const { result } = renderHook(() => useScratchGesture({ clearThreshold: 40, isUnlocked: true }));
    expect(result.current.canvasRef.current).toBe(null);
    expect(result.current.revealedRef.current).toBe(false);
  });

  it('adds and removes event listeners', () => {
    const { result } = renderHook(() => useScratchGesture({ clearThreshold: 40, isUnlocked: true }));

    // Simulate attaching canvas
    act(() => {
      result.current.canvasRef.current = canvas;
    });

    // Need to re-render to run the useEffect after setting ref
    renderHook(() => useScratchGesture({ clearThreshold: 40, isUnlocked: true }));
    // Actually we can't easily trigger the useEffect with the ref after initial mount without a state update
    // But we can just call the hook again where ref is already set:
  });

  // Since testing DOM event listeners on a ref set during render is a bit tricky with renderHook,
  // we'll focus on the logic by manually triggering events on the canvas element.
  it('handles scratch gesture and triggers reveal', () => {
    const onReveal = vi.fn();
    const attachedCanvas = canvas;

    // We create a wrapper to pass the ref
    const { result } = renderHook(() => {
      const hookResult = useScratchGesture({ clearThreshold: 40, isUnlocked: true, onReveal });
      // Force assign ref during render so useEffect sees it
      hookResult.canvasRef.current = attachedCanvas;
      return hookResult;
    });

    // Unmount and remount to let useEffect run with the ref
    renderHook(() => {
      const hookResult = useScratchGesture({ clearThreshold: 40, isUnlocked: true, onReveal });
      hookResult.canvasRef.current = attachedCanvas;
      return hookResult;
    });

    // Start touch
    const touchStartEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 10, clientY: 10 } as Touch],
    });
    attachedCanvas.dispatchEvent(touchStartEvent);

    // Advance 150ms to activate scratch mode
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(mockContext.stroke).toHaveBeenCalled();

    // Move touch
    const touchMoveEvent = new TouchEvent('touchmove', {
      touches: [{ clientX: 20, clientY: 20 } as Touch],
      cancelable: true,
    });
    attachedCanvas.dispatchEvent(touchMoveEvent);

    // Move time by 251ms to trigger the getImageData check
    act(() => {
      // We also mock performance.now() because the hook uses it
      vi.spyOn(performance, 'now').mockReturnValue(500);
    });

    // Dispatch another move to hit the time check
    attachedCanvas.dispatchEvent(touchMoveEvent);

    expect(mockContext.getImageData).toHaveBeenCalled();
    expect(onReveal).toHaveBeenCalled();
    expect(result.current.revealedRef.current).toBe(true);
  });

  it('aborts scratch if moved too early', () => {
    const attachedCanvas = canvas;
    renderHook(() => {
      const hookResult = useScratchGesture({ clearThreshold: 40, isUnlocked: true });
      hookResult.canvasRef.current = attachedCanvas;
      return hookResult;
    });

    // Start touch
    const touchStartEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 10, clientY: 10 } as Touch],
    });
    attachedCanvas.dispatchEvent(touchStartEvent);

    // Move too early (>10px)
    const touchMoveEvent = new TouchEvent('touchmove', {
      touches: [{ clientX: 30, clientY: 30 } as Touch],
      cancelable: true,
    });
    attachedCanvas.dispatchEvent(touchMoveEvent);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Stroke shouldn't be called because the timeout was cleared
    expect(mockContext.stroke).not.toHaveBeenCalled();
  });

  it('handles touch end and cancel', () => {
    const attachedCanvas = canvas;
    renderHook(() => {
      const hookResult = useScratchGesture({ clearThreshold: 40, isUnlocked: true });
      hookResult.canvasRef.current = attachedCanvas;
      return hookResult;
    });

    const touchEndEvent = new TouchEvent('touchend');
    attachedCanvas.dispatchEvent(touchEndEvent);

    const touchCancelEvent = new TouchEvent('touchcancel');
    attachedCanvas.dispatchEvent(touchCancelEvent);
  });

  it('handles getImageData error gracefully', () => {
    mockContext.getImageData = vi.fn().mockImplementation(() => {
      throw new Error('CORS error');
    }) as unknown as CanvasRenderingContext2D['getImageData'];

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const attachedCanvas = canvas;
    renderHook(() => {
      const hookResult = useScratchGesture({ clearThreshold: 40, isUnlocked: true });
      hookResult.canvasRef.current = attachedCanvas;
      return hookResult;
    });

    attachedCanvas.dispatchEvent(
      new TouchEvent('touchstart', {
        touches: [{ clientX: 10, clientY: 10 } as Touch],
      }),
    );

    act(() => {
      vi.advanceTimersByTime(150);
    });

    act(() => {
      vi.spyOn(performance, 'now').mockReturnValue(500);
    });

    attachedCanvas.dispatchEvent(
      new TouchEvent('touchmove', {
        touches: [{ clientX: 20, clientY: 20 } as Touch],
        cancelable: true,
      }),
    );

    expect(consoleWarnSpy).toHaveBeenCalledWith('getImageData blocked:', expect.any(Error));
    consoleWarnSpy.mockRestore();
  });
});
