import { AnimatePresence, motion } from 'framer-motion';
import type { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string | null;
  currentLength?: number;
}

export function Textarea({ error, className = '', disabled, maxLength, currentLength, ...props }: TextareaProps) {
  const isError = !!error;

  return (
    <div className={`relative w-full pb-6 ${className}`}>
      <div
        className={`
          relative flex w-full rounded-[16px] overflow-hidden
          bg-[#FFFDF8] transition-all duration-300
          border-2 z-10
          ${
            isError
              ? 'border-[#FF9494] shadow-[0_2px_8px_rgba(255,148,148,0.1)] focus-within:border-[#FF7070] focus-within:shadow-[0_4px_16px_rgba(255,112,112,0.25)]'
              : 'border-[#FFD1B3] shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus-within:border-[#FFB870] focus-within:shadow-[0_4px_16px_rgba(255,184,112,0.25)]'
          }
          ${disabled ? 'opacity-60 bg-[#F5F5F4] border-[#E5E5E4] cursor-not-allowed shadow-none' : ''}
        `}
      >
        <textarea
          className="flex-1 min-w-0 bg-transparent outline-none text-[#5D4037] text-[16px] font-medium placeholder:text-[#D7CCC8] p-4 resize-none"
          disabled={disabled}
          maxLength={maxLength}
          {...props}
        />
        {maxLength !== undefined && currentLength !== undefined && (
          <div className="absolute bottom-2 right-3 text-[11px] font-bold text-[#D7CCC8]">
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
            className="absolute bottom-0 left-0 right-0 flex justify-center pointer-events-none z-0"
          >
            <span className="text-[13px] font-bold text-[#FF5A5A] drop-shadow-[0_1px_2px_rgba(255,253,248,0.9)] tracking-wide">
              {error}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
