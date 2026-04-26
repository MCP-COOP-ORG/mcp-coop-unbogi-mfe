import { motion } from 'framer-motion';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { type ReactNode, useState } from 'react';

export interface FlipFlapProps {
  front: ReactNode;
  back: ReactNode;
  disabled?: boolean;
}

/** Bare icon with thin black outline around the arrow stroke, press effect, no container */
function FlipTrigger({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  const isLeft = side === 'left';
  return (
    <motion.button
      onClick={onClick}
      aria-label="Flip"
      whileTap={{ scale: 0.78 }}
      transition={{ type: 'spring', stiffness: 600, damping: 22 }}
      className={`absolute bottom-0 ${isLeft ? 'left-0' : 'right-0'} z-10
        p-0 bg-transparent border-none outline-none select-none`}
      style={{
        WebkitTapHighlightColor: 'transparent',
        cursor: 'pointer',
      }}
    >
      {isLeft ? (
        <ChevronsLeft size={26} strokeWidth={1.5} color="#000000ff" />
      ) : (
        <ChevronsRight size={26} strokeWidth={1.5} color="#000000ff" />
      )}
    </motion.button>
  );
}

function FaceWithButtons({
  children,
  onFlip,
  showButtons,
}: {
  children: ReactNode;
  onFlip: () => void;
  showButtons: boolean;
}) {
  return (
    <div className="relative w-full h-full overflow-visible">
      {children}
      {showButtons && <FlipTrigger side="left" onClick={onFlip} />}
      {showButtons && <FlipTrigger side="right" onClick={onFlip} />}
    </div>
  );
}

export function FlipFlap({ front, back, disabled = false }: FlipFlapProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const toggle = () => setIsFlipped((v) => !v);

  return (
    <div className="w-full h-full relative" style={{ perspective: '15000px' }}>
      <div
        className="relative w-full h-full transition-transform duration-700 ease-in-out shadow-lg"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
          <FaceWithButtons onFlip={toggle} showButtons={!disabled}>
            {front}
          </FaceWithButtons>
        </div>

        {/* Back — pre-rotated 180°; double scaleX(-1) keeps corners un-mirrored */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="relative w-full h-full" style={{ transform: 'scaleX(-1)' }}>
            <div style={{ transform: 'scaleX(-1)', width: '100%', height: '100%', position: 'relative' }}>{back}</div>
            {!disabled && (
              <>
                <FlipTrigger side="left" onClick={toggle} />
                <FlipTrigger side="right" onClick={toggle} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
