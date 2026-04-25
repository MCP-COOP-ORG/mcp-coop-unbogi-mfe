import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode, SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  icon?: ReactNode;
  options: SelectOption[];
  error?: string | null;
  placeholder?: string;
}

export function Select({ icon, options, error, placeholder, className = '', disabled, value, ...props }: SelectProps) {
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
        {icon && (
          <div className={`w-11 h-full flex items-center justify-center shrink-0 transition-colors ${iconColor}`}>
            {icon}
          </div>
        )}
        <select
          className={`
            flex-1 h-full bg-transparent outline-none min-w-0 appearance-none
            text-[14px] font-bold
            ${value ? 'text-[#1A1A1A]' : 'text-[#A1A1AA]'}
            ${icon ? 'pl-0' : 'pl-4'}
            pr-10
          `}
          disabled={disabled}
          value={value}
          style={{ colorScheme: 'light' }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-[#A1A1AA] bg-[#FFF5E1]">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-[#1A1A1A] bg-[#FFF5E1]">
              {opt.label}
            </option>
          ))}
        </select>

        {/* Chevron */}
        <div className="absolute right-4 pointer-events-none text-[#1A1A1A]">
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
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
