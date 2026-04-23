import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface GlassSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: ReactNode;
  className?: string;
}

export function GlassSelect({ options, value, onChange, placeholder = '', icon, className = '' }: GlassSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  /* close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* ── trigger ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          'flex items-center w-full h-[38px] rounded-full overflow-hidden cursor-pointer',
          'bg-white/[0.08]',
          'backdrop-blur-[40px] backdrop-saturate-[180%]',
          'border-[0.5px] border-white/[0.18]',
          'shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_0.5px_0_rgba(255,255,255,0.2)]',
          'transition-all duration-150',
          open ? 'border-white/30 bg-white/[0.12]' : '',
        ].join(' ')}
      >
        {icon && <div className="w-10 flex items-center justify-center shrink-0 text-white/40">{icon}</div>}
        <span
          className={[
            'flex-1 text-left text-[14px] font-normal truncate',
            icon ? '' : 'pl-5',
            selected ? 'text-white/90' : 'text-white/25',
          ].join(' ')}
        >
          {selected?.label || placeholder}
        </span>
        <div
          className={[
            'w-10 flex items-center justify-center shrink-0 text-white/40 transition-transform duration-200',
            open ? 'rotate-180' : '',
          ].join(' ')}
        >
          <ChevronDown size={14} strokeWidth={2} />
        </div>
      </button>

      {/* ── dropdown ── */}
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={[
              'absolute left-0 right-0 top-[calc(100%+6px)] z-50',
              'max-h-[200px] overflow-y-auto',
              'rounded-2xl p-[10px]',
              'bg-[rgba(18,8,32,0.92)]',
              'backdrop-blur-[40px] backdrop-saturate-[180%]',
              'border-[0.5px] border-white/[0.15]',
              'shadow-[0_16px_48px_rgba(0,0,0,0.6)]',
            ].join(' ')}
          >
            {options.map((opt, idx) => {
              const isActive = opt.value === value;
              const isLast = idx === options.length - 1;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={[
                      'w-full text-left px-5 py-3 text-[14px] cursor-pointer',
                      'transition-colors duration-100',
                      isActive
                        ? 'text-white/95 bg-white/[0.08]'
                        : 'text-white/60 hover:text-white/80 hover:bg-white/[0.05]',
                      !isLast ? 'border-b border-white/[0.08]' : '',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
