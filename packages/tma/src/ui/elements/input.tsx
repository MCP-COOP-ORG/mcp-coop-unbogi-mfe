import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { FormField } from './form-field';

type InputVariant = 'normal' | 'error';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  error?: string | null;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'normal', leftIcon, rightIcon, error, className = '', onFocus, disabled, ...props }, ref) => {
    const isError = variant === 'error' || !!error;
    const iconColor = isError ? 'text-[#EB2D2D]' : 'text-[#1A1A1A]';

    return (
      <FormField
        error={error}
        isError={isError}
        disabled={disabled}
        className={className}
        innerClassName="items-center h-[42px]"
      >
        {leftIcon && (
          <div className={`w-11 h-full flex items-center justify-center shrink-0 transition-colors ${iconColor}`}>
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          className={`flex-1 h-full bg-transparent outline-none min-w-0 text-[#1A1A1A] text-[14px] font-bold tracking-wide placeholder:text-[#1A1A1A]/25 placeholder:font-medium placeholder:tracking-normal ${leftIcon ? 'pl-0' : 'pl-4'} ${rightIcon ? 'pr-0' : 'pr-4'}`}
          onFocus={onFocus}
          disabled={disabled}
          {...props}
        />

        {rightIcon && (
          <div className={`w-11 h-full flex items-center justify-center shrink-0 transition-colors ${iconColor}`}>
            {rightIcon}
          </div>
        )}
      </FormField>
    );
  },
);

Input.displayName = 'Input';
