import { AnimatePresence, motion } from 'framer-motion';
import type { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string | null;
  currentLength?: number;
}

export function Textarea({ error, className = '', disabled, maxLength, currentLength, ...props }: TextareaProps) {
  const isError = !!error;

  const shadow = isError
    ? [
        'shadow-[0_0_0_1px_#1A1A1A,0_0_0_3px_#EB2D2D,0_0_0_4px_#1A1A1A,0_2px_8px_rgba(235,45,45,0.25)]',
        'focus-within:shadow-[0_0_0_1px_#1A1A1A,0_0_0_3px_#EB2D2D,0_0_0_4px_#1A1A1A,0_4px_16px_rgba(235,45,45,0.55)]',
      ].join(' ')
    : [
        'shadow-[0_0_0_1px_#1A1A1A,0_0_0_3px_#FFD1B3,0_0_0_4px_#1A1A1A]',
        'focus-within:shadow-[0_0_0_1px_#1A1A1A,0_0_0_3px_#FFB870,0_0_0_4px_#1A1A1A,0_4px_16px_rgba(255,184,112,0.4)]',
      ].join(' ');

  return (
    <div className={`relative w-full pb-8 ${className}`}>
      <div
        className={`
          relative flex w-full rounded-[14px] overflow-hidden
          bg-[#FFF5E1] transition-shadow duration-200 z-10
          ${shadow}
          ${disabled ? 'opacity-60 pointer-events-none !shadow-[0_0_0_1px_#CCC,0_0_0_3px_#EEE,0_0_0_4px_#CCC]' : ''}
        `}
      >
        <textarea
          className="flex-1 min-w-0 bg-transparent outline-none text-[#1A1A1A] text-[14px] font-bold placeholder:text-[#A1A1AA] placeholder:font-normal p-4 resize-none"
          disabled={disabled}
          maxLength={maxLength}
          {...props}
        />
        {maxLength !== undefined && currentLength !== undefined && (
          <div className="absolute bottom-2 right-3 text-[11px] font-bold text-[#A1A1AA]">
            {currentLength} / {maxLength}
          </div>
        )}
      </div>

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
              style={{
                color: '#EB2D2D',
                textShadow:
                  '-0.5px -0.5px 0 #1A1A1A, 0.5px -0.5px 0 #1A1A1A, -0.5px 0.5px 0 #1A1A1A, 0.5px 0.5px 0 #1A1A1A, 0 1px 4px rgba(255,255,255,0.9)',
              }}
            >
              {error}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
