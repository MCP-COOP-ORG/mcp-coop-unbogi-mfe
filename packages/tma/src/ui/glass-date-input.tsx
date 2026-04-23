import { Calendar } from 'lucide-react';

interface GlassDateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function GlassDateInput({
  value,
  onChange,
  placeholder = 'Choose a date',
  className = '',
}: GlassDateInputProps) {
  /* format for display — preserves date + time */
  const formatted = value
    ? new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className={`relative ${className}`}>
      {/* ── Visual layer — decorative only, never receives pointer events ── */}
      <div
        aria-hidden="true"
        className={[
          'flex items-center w-full h-[38px] rounded-full overflow-hidden pointer-events-none',
          'bg-white/[0.08]',
          'backdrop-blur-[40px] backdrop-saturate-[180%]',
          'border-[0.5px] border-white/[0.18]',
          'shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_0.5px_0_rgba(255,255,255,0.2)]',
        ].join(' ')}
      >
        <div className="w-10 flex items-center justify-center shrink-0 text-white/40">
          <Calendar size={15} strokeWidth={2} />
        </div>
        <span
          className={[
            'flex-1 text-left text-[14px] font-normal truncate pr-5',
            formatted ? 'text-white/90' : 'text-white/25',
          ].join(' ')}
        >
          {formatted || placeholder}
        </span>
      </div>

      {/*
        ── Native datetime-local input — transparent overlay on top ──
        iOS Safari opens its native picker on a direct tap to <input>.
        showPicker() is Chrome-only and silently fails on WebKit — removed.
        No pointer-events-none, no tabIndex=-1 — input must be reachable.
      */}
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
      />
    </div>
  );
}
