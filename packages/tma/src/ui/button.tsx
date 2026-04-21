import type { ButtonHTMLAttributes } from 'react';
import { tg } from '@/lib/telegram';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'glass';
}

export function Button({ variant = 'glass', className = '', onClick, ...props }: ButtonProps) {
  const base = 'px-6 py-3 rounded-2xl font-bold text-[15px] tracking-wide transition-all active:scale-[0.97] cursor-pointer';

  const variants = {
    primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white shadow-lg',
    glass: 'bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] text-white hover:bg-[var(--glass-bg-hover)]',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    tg.haptic('light');
    onClick?.(e);
  };

  return (
    <button
      type="button"
      className={`${base} ${variants[variant]} ${className}`}
      onClick={handleClick}
      {...props}
    />
  );
}
