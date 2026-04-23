import type { TextareaHTMLAttributes } from 'react';

interface GlassTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxChars?: number;
  currentLength?: number;
}

export function GlassTextarea({ className = '', maxChars, currentLength = 0, onFocus, ...props }: GlassTextareaProps) {
  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    /*
     * Wait for iOS keyboard to finish animating (~300ms) before scrolling,
     * otherwise the scroll target position is calculated before viewport shrinks.
     */
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
    onFocus?.(e);
  };

  return (
    <div className="relative">
      <textarea
        className={[
          'w-full rounded-[var(--radius-lg)] resize-none',
          'bg-white/[0.08]',
          'backdrop-blur-[40px] backdrop-saturate-[180%]',
          'border-[0.5px] border-white/[0.18]',
          'shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_0.5px_0_rgba(255,255,255,0.2)]',
          'focus:border-white/30 focus:bg-white/[0.12]',
          'transition-all duration-150',
          'text-white/90 text-[14px] font-normal',
          'placeholder:text-white/25',
          'outline-none',
          className,
        ].join(' ')}
        style={{ padding: '12px 20px' }}
        onFocus={handleFocus}
        {...props}
      />
      {maxChars !== undefined && (
        <span
          className={[
            'absolute bottom-2.5 right-4 text-[11px] font-normal transition-colors',
            currentLength > maxChars ? 'text-red-400' : 'text-white/20',
          ].join(' ')}
        >
          {currentLength}/{maxChars}
        </span>
      )}
    </div>
  );
}
