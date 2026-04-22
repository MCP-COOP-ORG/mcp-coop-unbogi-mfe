import type { InputHTMLAttributes, ReactNode } from 'react';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

export function Input({ icon, className = '', ...props }: GlassInputProps) {
  return (
    <div
      className={[
        'flex items-center h-[38px] rounded-full overflow-hidden',
        'bg-white/[0.08]',
        'backdrop-blur-[40px] backdrop-saturate-[180%]',
        'border-[0.5px] border-white/[0.18]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_0.5px_0_rgba(255,255,255,0.2)]',
        'focus-within:border-white/30 focus-within:bg-white/[0.12]',
        'transition-all duration-150',
        className,
      ].join(' ')}
    >
      {icon && (
        <div className="w-10 flex items-center justify-center shrink-0 text-white/40">
          {icon}
        </div>
      )}
      <input
        className={[
          'flex-1 h-full bg-transparent outline-none min-w-0',
          'text-white/90 text-[14px] font-normal',
          'placeholder:text-white/25',
          icon ? 'pr-5' : 'px-5',
        ].join(' ')}
        {...props}
      />
    </div>
  );
}
