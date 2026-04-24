import { ArrowLeftRight } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useT } from '@/hooks/use-t';
import { Button } from './button';

export interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  /** When true, hides the flip button — reserved for future Lock/Scratch overlay. */
  disabled?: boolean;
}

/**
 * 3-D flip card primitive.
 * Uses CSS preserve-3d + backface-visibility: hidden on both faces.
 * The toggle button floats above the 3-D container at z-50.
 */
export function FlipCard({ front, back, disabled = false }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const t = useT();

  return (
    <div className="w-full h-full relative" style={{ perspective: '15000px' }}>
      {/* 3-D rotating wrapper */}
      <div
        className="relative w-full h-full transition-transform duration-700 ease-in-out shadow-lg"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front face */}
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
          {front}
        </div>

        {/* Back face — pre-rotated 180° so it appears correct after the flip */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {back}
        </div>
      </div>

      {/* Flip toggle — frosted-glass circle with purple glow */}
      {!disabled && (
        <Button
          layout="circle"
          variant="transparent"
          onClick={() => setIsFlipped((v) => !v)}
          className="absolute bottom-[20px] left-1/2 -translate-x-1/2 z-50 !w-[48px] !h-[48px] shadow-[0_0_16px_rgba(124,58,237,0.4)]"
          aria-label={t.giftBack.flipCard}
        >
          <ArrowLeftRight className="w-[20px] h-[20px] text-black/80" />
        </Button>
      )}
    </div>
  );
}
