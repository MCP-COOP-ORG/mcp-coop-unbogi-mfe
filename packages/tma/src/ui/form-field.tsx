import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { COLORS, ERROR_TEXT_SHADOW, FIELD_SHADOW, FIELD_SHADOW_ERROR, FIELD_SHADOW_NORMAL } from './theme-constants';

export interface FormFieldProps {
  children: ReactNode;
  error?: string | null;
  isError?: boolean;
  disabled?: boolean;
  className?: string;
  innerClassName?: string;
}

export function FormField({ children, error, isError, disabled, className = '', innerClassName = '' }: FormFieldProps) {
  const hasError = isError || !!error;
  const shadow = disabled ? FIELD_SHADOW.disabled : hasError ? FIELD_SHADOW_ERROR : FIELD_SHADOW_NORMAL;

  return (
    <div className={`relative w-full pb-8 ${className}`}>
      <div
        className={`relative flex w-full rounded-[14px] overflow-hidden bg-[#FFF5E1] transition-shadow duration-200 z-10 ${shadow} ${disabled ? 'opacity-60 pointer-events-none' : ''} ${innerClassName}`}
      >
        {children}
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
                color: COLORS.error,
                textShadow: ERROR_TEXT_SHADOW,
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
