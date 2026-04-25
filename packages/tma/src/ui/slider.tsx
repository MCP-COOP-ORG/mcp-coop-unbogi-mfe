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

    const slides = Array.from(container.children) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const index = slides.indexOf(entry.target as HTMLElement);
            if (index !== -1) setActiveIndex(index);
          }
        });
      },
      { root: container, threshold: 0.5 },
    );

    slides.forEach((slide) => {
      observer.observe(slide);
    });
    return () => observer.disconnect();
  }, []);

  const total = items.length;

  const dots =
    total <= 1 ? null : (
      <div className="absolute -bottom-[28px] left-0 right-0 flex items-center justify-center gap-[6px] pointer-events-none z-10">
        {items.map((item, i) => {
          const isActive = i === activeIndex;
          return (
            <motion.div
              key={getKey(item)}
              initial={false}
              animate={{
                width: isActive ? 24 : 7,
                opacity: isActive ? 1 : 0.45,
              }}
              className="h-[7px] rounded-full bg-white border border-black"
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
