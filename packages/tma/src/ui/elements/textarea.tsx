import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { FormField } from './form-field';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string | null;
  currentLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = '', disabled, maxLength, currentLength, ...props }, ref) => {
    const isError = !!error;

    return (
      <FormField error={error} isError={isError} disabled={disabled} className={className}>
        <textarea
          ref={ref}
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
      </FormField>
    );
  },
);

Textarea.displayName = 'Textarea';
