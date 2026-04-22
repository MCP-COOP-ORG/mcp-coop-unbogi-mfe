import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { tg } from '@/lib/telegram';

/**
 * Apple-style frosted glass icon button.
 * 32×32 circle, strong backdrop blur + saturation, thin half-pixel border,
 * subtle inner top-highlight, soft diffuse shadow.
 */
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function IconButton({ className = '', onClick, children, disabled, ...props }: IconButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    tg.haptic('light');
    onClick?.(e);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        /* layout */
        'flex items-center justify-center w-[38px] h-[38px] rounded-full',
        /* Apple frosted glass material */
        'bg-white/[0.08]',
        'backdrop-blur-[40px] backdrop-saturate-[180%]',
        /* thin half-pixel border + inner top highlight */
        'border-[0.5px] border-white/[0.18]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_0.5px_0_rgba(255,255,255,0.2)]',
        /* text */
        'text-white/90',
        /* interaction */
        'transition-all duration-150 ease-out',
        'active:scale-90 active:bg-white/[0.14]',
        'disabled:opacity-30 disabled:pointer-events-none',
        'cursor-pointer select-none',
        className,
      ].join(' ')}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}
