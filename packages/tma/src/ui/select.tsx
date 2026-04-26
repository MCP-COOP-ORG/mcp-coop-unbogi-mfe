import type { ReactNode, SelectHTMLAttributes } from 'react';
import { FormField } from './form-field';

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
  const iconColor = isError ? 'text-[#EB2D2D]' : 'text-[#1A1A1A]';

  return (
    <FormField
      error={error}
      isError={isError}
      disabled={disabled}
      className={className}
      innerClassName="items-center h-[42px]"
    >
      {icon && (
        <div className={`w-11 h-full flex items-center justify-center shrink-0 transition-colors ${iconColor}`}>
          {icon}
        </div>
      )}
      <select
        className={`flex-1 h-full bg-transparent outline-none min-w-0 appearance-none text-[14px] font-bold ${value ? 'text-[#1A1A1A]' : 'text-[#A1A1AA]'} ${icon ? 'pl-0' : 'pl-4'} pr-10`}
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
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </FormField>
  );
}
