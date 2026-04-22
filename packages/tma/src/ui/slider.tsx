import { motion } from 'framer-motion';
import { type ReactNode, useEffect, useRef, useState } from 'react';

interface SliderProps<T> {
  items: T[];
  /** Returns a stable unique key for each item — never use array index. */
  getKey: (item: T) => string;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
}

/**
 * Generic horizontal snap-scroll slider.
 *
 * Requires a `getKey` prop so React never uses array-index as a key.
 * Animated framer-motion dots below indicate the active slide.
 */
export function Slider<T>({ items, getKey, renderItem, className = '' }: SliderProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const width = container.clientWidth;
      if (width === 0) return;
      // Slide width + gap-4 (16 px)
      const index = Math.round(container.scrollLeft / (width + 16));
      setActiveIndex(index);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const total = items.length;

  const dots =
    total <= 1 ? null : (
      <div className="absolute -bottom-[25px] left-0 right-0 flex items-center justify-center gap-2 pointer-events-none z-10">
        {items.map((item, i) => {
          const isActive = i === activeIndex;
          return (
            <motion.div
              key={getKey(item)}
              initial={false}
              animate={{
                width: isActive ? 20 : 6,
                backgroundColor: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)',
              }}
              className="h-[6px] rounded-full shadow-sm"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          );
        })}
      </div>
    );

  return (
    <div className={`w-full h-full relative ${className}`}>
      <div
        ref={containerRef}
        className="w-full h-full flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {items.map((item, index) => (
          <div key={getKey(item)} className="w-full h-full flex-shrink-0 snap-center relative">
            {renderItem(item, index)}
          </div>
        ))}
      </div>
      {dots}
    </div>
  );
}
