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

  return (
    <div className={`relative w-full pb-6 ${className}`}>
      <div
        className={`
          relative flex items-center h-[48px] w-full rounded-[16px] overflow-hidden
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
        {icon && (
          <div
            className={`w-12 h-full flex items-center justify-center shrink-0 transition-colors ${isError ? 'text-[#FF9494]' : 'text-[#BCAAA4]'}`}
          >
            {icon}
          </div>
        )}
        <select
          className={`
            flex-1 h-full bg-transparent outline-none min-w-0 appearance-none
            text-[16px] font-medium
            ${value ? 'text-[#5D4037]' : 'text-[#D7CCC8]'}
            ${icon ? 'pl-0' : 'pl-4'}
            pr-10
          `}
          disabled={disabled}
          value={value}
          style={{ colorScheme: 'light' }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-[#D7CCC8] bg-[#FFFDF8]">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-[#5D4037] bg-[#FFFDF8]">
              {opt.label}
            </option>
          ))}
        </select>
        {/* custom chevron icon */}
        <div className="absolute right-4 pointer-events-none text-[#BCAAA4]">
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
