import { AnimatePresence, motion } from 'framer-motion';
import type { InputHTMLAttributes, ReactNode } from 'react';

export type InputVariant = 'normal' | 'error';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  error?: string | null;
}

export function Input({
  variant = 'normal',
  leftIcon,
  rightIcon,
  error,
  className = '',
  onFocus,
  disabled,
  ...props
}: InputProps) {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    onFocus?.(e);
  };

  const isError = variant === 'error' || !!error;

  // Inked outline — same 3-layer shadow system as Button / BottomNav pill.
  // Ring color shifts on focus and turns red on error.
  const shadow = isError
    ? [
        'shadow-[0_0_0_1px_#1A1A1A,0_0_0_3px_#EB2D2D,0_0_0_4px_#1A1A1A,0_2px_8px_rgba(235,45,45,0.25)]',
        'focus-within:shadow-[0_0_0_1px_#1A1A1A,0_0_0_3px_#EB2D2D,0_0_0_4px_#1A1A1A,0_4px_16px_rgba(235,45,45,0.55)]',
      ].join(' ')
    : [
        'shadow-[0_0_0_1px_#1A1A1A,0_0_0_3px_#FFD1B3,0_0_0_4px_#1A1A1A]',
        'focus-within:shadow-[0_0_0_1px_#1A1A1A,0_0_0_3px_#FFB870,0_0_0_4px_#1A1A1A,0_4px_16px_rgba(255,184,112,0.4)]',
      ].join(' ');

  const iconColor = isError ? 'text-[#EB2D2D]' : 'text-[#1A1A1A]';

  return (
    <div className={`relative w-full pb-8 ${className}`}>
      <div
        className={`
          relative flex items-center h-[42px] w-full rounded-[14px] overflow-hidden
          bg-[#FFF5E1] transition-shadow duration-200 z-10
          ${shadow}
          ${disabled ? 'opacity-60 pointer-events-none !shadow-[0_0_0_1px_#CCC,0_0_0_3px_#EEE,0_0_0_4px_#CCC]' : ''}
        `}
      >
        {leftIcon && (
          <div className={`w-11 h-full flex items-center justify-center shrink-0 transition-colors ${iconColor}`}>
            {leftIcon}
          </div>
        )}

        <input
          className={`
            flex-1 h-full bg-transparent outline-none min-w-0
            text-[#1A1A1A] text-[14px] font-bold tracking-wide
            placeholder:text-[#1A1A1A]/25 placeholder:font-medium placeholder:tracking-normal
            ${leftIcon ? 'pl-0' : 'pl-4'}
            ${rightIcon ? 'pr-0' : 'pr-4'}
          `}
          onFocus={handleFocus}
          disabled={disabled}
          {...props}
        />

        {rightIcon && (
          <div className={`w-11 h-full flex items-center justify-center shrink-0 transition-colors ${iconColor}`}>
            {rightIcon}
          </div>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-0 left-0 right-0 flex justify-center pointer-events-none z-20"
          >
            <span
              className="text-[14px] uppercase tracking-[0.15em] font-bold text-center"
              style={{ color: '#EB2D2D', textShadow: '-0.5px -0.5px 0 #1A1A1A, 0.5px -0.5px 0 #1A1A1A, -0.5px 0.5px 0 #1A1A1A, 0.5px 0.5px 0 #1A1A1A, 0 1px 4px rgba(255,255,255,0.9)' }}
            >
              {error}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
