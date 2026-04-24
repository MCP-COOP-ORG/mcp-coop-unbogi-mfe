import { useCallback, useEffect, useRef, useState } from 'react';

export interface ScratchCanvasProps {
  clearThreshold?: number;
  brushSize?: number;
  isUnlocked?: boolean;
  onReveal?: () => void;
}

export function ScratchCanvas({
  clearThreshold = 40,
  brushSize = 80,
  isUnlocked = false,
  onReveal,
}: ScratchCanvasProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const patternCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fingerprintImgRef = useRef<HTMLImageElement | null>(null);
  const progressRef = useRef(isUnlocked ? 1 : 0);
  const animationRef = useRef<number | null>(null);
  const onRevealRef = useRef(onReveal);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    onRevealRef.current = onReveal;
  }, [onReveal]);

  const drawCanvasState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';

    // Draw Base Texture
    if (patternCanvasRef.current) {
      const pattern = ctx.createPattern(patternCanvasRef.current, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, parent.clientWidth, parent.clientHeight);
      }
    }

    const progress = progressRef.current;

    // Draw Light & Fingerprint if progress > 0
    if (progress > 0) {
      const printX = parent.clientWidth * 0.35;
      const printY = parent.clientHeight * 0.85;
      const radius = Math.max(parent.clientWidth, parent.clientHeight) * 1.5;

      const gradient = ctx.createRadialGradient(printX, printY, 0, printX, printY, radius);
      gradient.addColorStop(0, `rgba(230, 170, 100, ${0.4 * progress})`);
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, `rgba(20, 12, 28, ${0.85 * progress})`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, parent.clientWidth, parent.clientHeight);

      if (fingerprintImgRef.current?.complete) {
        const size = 90;
        ctx.save();
        ctx.globalAlpha = 0.5 * progress;
        ctx.translate(printX, printY);
        ctx.rotate((-45 * Math.PI) / 180);

        ctx.shadowColor = `rgba(0,0,0,${0.6 * progress})`;
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;

        ctx.drawImage(fingerprintImgRef.current, -size / 2, -size / 2, size, size);
        ctx.restore();
      }
    }
    ctx.restore();

    // Prepare context for erasing
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = brushSize;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
  }, [brushSize]);

  // Initialization: Setup Pattern & SVG Image
  useEffect(() => {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 128;
    pCanvas.height = 128;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const imgData = pCtx.createImageData(128, 128);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        let noise = (Math.random() - 0.5) * 15;
        if (Math.random() > 0.95) noise += 10;
        if (Math.random() > 0.98) noise -= 15;
        data[i] = 45 + noise;
        data[i + 1] = 38 + noise;
        data[i + 2] = 52 + noise;
        data[i + 3] = 255;
      }
      pCtx.putImageData(imgData, 0, 0);
      patternCanvasRef.current = pCanvas;
    }

    const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 24 24" fill="url(#gold)">
      <defs>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FCEABB" />
          <stop offset="100%" stop-color="#F8B500" />
        </linearGradient>
      </defs>
      <path d="M17.81,4.47C17.73,4.47 17.65,4.45 17.58,4.41C15.66,3.42 14,3 12,3C10.03,3 8.15,3.47 6.44,4.41C6.2,4.54 5.9,4.45 5.76,4.21C5.63,3.97 5.72,3.66 5.96,3.53C7.82,2.5 9.86,2 12,2C14.14,2 16,2.47 18.04,3.5C18.29,3.65 18.38,3.95 18.25,4.19C18.16,4.37 18,4.47 17.81,4.47M3.5,9.72C3.4,9.72 3.3,9.69 3.21,9.63C3,9.47 2.93,9.16 3.09,8.93C4.08,7.53 5.34,6.43 6.84,5.66C10,4.04 14,4.03 17.15,5.65C18.65,6.42 19.91,7.5 20.9,8.9C21.06,9.12 21,9.44 20.78,9.6C20.55,9.76 20.24,9.71 20.08,9.5C19.18,8.22 18.04,7.23 16.69,6.54C13.82,5.07 10.15,5.07 7.29,6.55C5.93,7.25 4.79,8.25 3.89,9.5C3.81,9.65 3.66,9.72 3.5,9.72M9.75,21.79C9.62,21.79 9.5,21.74 9.4,21.64C8.53,20.77 8.06,20.21 7.39,19C6.7,17.77 6.34,16.27 6.34,14.66C6.34,11.69 8.88,9.27 12,9.27C15.12,9.27 17.66,11.69 17.66,14.66A0.5,0.5 0 0,1 17.16,15.16A0.5,0.5 0 0,1 16.66,14.66C16.66,12.24 14.57,10.27 12,10.27C9.43,10.27 7.34,12.24 7.34,14.66C7.34,16.1 7.66,17.43 8.27,18.5C8.91,19.66 9.35,20.15 10.12,20.93C10.31,21.13 10.31,21.44 10.12,21.64C10,21.74 9.88,21.79 9.75,21.79M16.92,19.94C15.73,19.94 14.68,19.64 13.82,19.05C12.33,18.04 11.44,16.4 11.44,14.66A0.5,0.5 0 0,1 11.94,14.16A0.5,0.5 0 0,1 12.44,14.66C12.44,16.07 13.16,17.4 14.38,18.22C15.09,18.7 15.92,18.93 16.92,18.93C17.16,18.93 17.56,18.9 17.96,18.83C18.23,18.78 18.5,18.96 18.54,19.24C18.59,19.5 18.41,19.77 18.13,19.82C17.56,19.93 17.06,19.94 16.92,19.94M14.91,22C14.87,22 14.82,22 14.78,22C13.19,21.54 12.15,20.95 11.06,19.88C9.66,18.5 8.89,16.64 8.89,14.66C8.89,13.04 10.27,11.72 11.97,11.72C13.67,11.72 15.05,13.04 15.05,14.66C15.05,15.73 16,16.6 17.13,16.6C18.28,16.6 19.21,15.73 19.21,14.66C19.21,10.89 15.96,7.83 11.96,7.83C9.12,7.83 6.5,9.41 5.35,11.86C4.96,12.67 4.76,13.62 4.76,14.66C4.76,15.44 4.83,16.67 5.43,18.27C5.53,18.53 5.4,18.82 5.14,18.91C4.88,19 4.59,18.87 4.5,18.62C4,17.31 3.77,16 3.77,14.66C3.77,13.46 4,12.37 4.45,11.42C5.78,8.63 8.73,6.82 11.96,6.82C16.5,6.82 20.21,10.33 20.21,14.65C20.21,16.27 18.83,17.59 17.13,17.59C15.43,17.59 14.05,16.27 14.05,14.65C14.05,13.58 13.12,12.71 11.97,12.71C10.82,12.71 9.89,13.58 9.89,14.65C9.89,16.36 10.55,17.96 11.76,19.16C12.71,20.1 13.62,20.62 15.03,21C15.3,21.08 15.45,21.36 15.38,21.62C15.33,21.85 15.12,22 14.91,22Z" />
    </svg>`;
    const img = new Image();
    img.onload = () => {
      fingerprintImgRef.current = img;
      if (progressRef.current > 0) {
        drawCanvasState();
      }
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
  }, [drawCanvasState]);

  // Handle Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = parent.clientWidth * dpr;
        canvas.height = parent.clientHeight * dpr;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
        drawCanvasState();
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [drawCanvasState]);

  // Handle Animation on Unlock
  useEffect(() => {
    if (isUnlocked && progressRef.current === 0) {
      const startTime = performance.now();
      const duration = 800;

      const animate = (time: number) => {
        const elapsed = time - startTime;
        let progress = elapsed / duration;
        if (progress > 1) progress = 1;
        progressRef.current = progress;

        drawCanvasState();

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isUnlocked, drawCanvasState]);

  // Handle Touch/Scratch Logic
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
      if (e.touches.length > 1 || localRevealed || progressRef.current === 0) return;

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
      if (localRevealed || progressRef.current === 0) return;

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
          if (now - lastCheckTime > 150) {
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
                setIsRevealed(true);
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
  }, [clearThreshold]);

  return (
    <div
      className={`w-full h-full relative cursor-crosshair rounded-[inherit] overflow-hidden ${
        isRevealed ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full shadow-[inset_0_0_6px_rgba(0,0,0,0.4)] transition-opacity duration-700 ease-out ${
          isRevealed ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ border: '1px solid rgb(102, 99, 99)', borderRadius: 'inherit' }}
      />
    </div>
  );
}
