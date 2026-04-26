import { useEffect, useRef } from 'react';

export interface ScratchGestureOptions {
  /** Percent of canvas that must be erased to trigger reveal (0–100). */
  clearThreshold: number;
  /** Whether scratching is allowed. */
  isUnlocked: boolean;
  /** Callback fired once when clearThreshold is exceeded. */
  onReveal?: () => void;
}

/**
 * Encapsulates all touch-based scratch gesture logic.
 *
 * Handles:
 *   - 150ms hold-to-scratch activation (avoids accidental scratches on scroll)
 *   - Touch-move erasing via canvas destination-out compositing
 *   - Throttled transparency check (every 250ms) against clearThreshold
 *   - One-shot reveal callback
 *
 * Returns a ref to attach to the target <canvas> element
 * and a boolean ref indicating if the canvas has been revealed.
 */
export function useScratchGesture({ clearThreshold, isUnlocked, onReveal }: ScratchGestureOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const revealedRef = useRef(false);
  const onRevealRef = useRef(onReveal);

  useEffect(() => {
    onRevealRef.current = onReveal;
  }, [onReveal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let scratchModeTimeout: ReturnType<typeof setTimeout> | null = null;
    let isScratchingMode = false;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    let lastCheckTime = 0;
    let localRevealed = false;

    const clearScratchTimeout = () => {
      if (scratchModeTimeout) {
        clearTimeout(scratchModeTimeout);
        scratchModeTimeout = null;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1 || localRevealed || !isUnlocked) return;

      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      lastX = startX;
      lastY = startY;
      isScratchingMode = false;

      clearScratchTimeout();
      scratchModeTimeout = setTimeout(() => {
        isScratchingMode = true;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          const rect = canvas.getBoundingClientRect();
          ctx.beginPath();
          ctx.moveTo(lastX - rect.left, lastY - rect.top);
          ctx.lineTo(lastX - rect.left, lastY - rect.top + 0.1);
          ctx.stroke();
        }
      }, 150);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (localRevealed || !isUnlocked) return;

      const touch = e.touches[0];
      const dxFromStart = touch.clientX - startX;
      const dyFromStart = touch.clientY - startY;

      if (!isScratchingMode) {
        if (Math.abs(dxFromStart) > 10 || Math.abs(dyFromStart) > 10) {
          clearScratchTimeout();
        }
        return;
      }

      if (isScratchingMode) {
        e.preventDefault();

        const ctx = canvas.getContext('2d');
        if (ctx) {
          const rect = canvas.getBoundingClientRect();

          ctx.beginPath();
          ctx.moveTo(lastX - rect.left, lastY - rect.top);
          ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
          ctx.stroke();

          lastX = touch.clientX;
          lastY = touch.clientY;

          const now = performance.now();
          if (now - lastCheckTime > 250) {
            lastCheckTime = now;

            try {
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const data = imageData.data;

              let transparentPixels = 0;
              let totalPixelsChecked = 0;

              for (let i = 3; i < data.length; i += 64) {
                totalPixelsChecked++;
                if (data[i] < 128) {
                  transparentPixels++;
                }
              }

              const percentCleared = (transparentPixels / totalPixelsChecked) * 100;

              if (percentCleared >= clearThreshold && !localRevealed) {
                localRevealed = true;
                revealedRef.current = true;
                if (onRevealRef.current) onRevealRef.current();
                clearScratchTimeout();
              }
            } catch (err) {
              console.warn('getImageData blocked:', err);
            }
          }
        }
      }
    };

    const handleTouchEnd = () => {
      clearScratchTimeout();
      isScratchingMode = false;
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      clearScratchTimeout();
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [clearThreshold, isUnlocked]);

  return { canvasRef, revealedRef };
}
