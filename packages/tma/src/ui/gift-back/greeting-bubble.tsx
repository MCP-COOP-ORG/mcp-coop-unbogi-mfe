import { useT } from '@/hooks/use-t';

interface GreetingBubbleProps {
  text: string;
  senderName: string;
  date: Date;
}

/**
 * Greeting bubble — gift message in a frosted glass card.
 * Shows decorative quotes, the greeting text, and "{from} {sender} • {date}" beneath.
 */
export function GreetingBubble({ text, senderName, date }: GreetingBubbleProps) {
  const t = useT();

  const dateStr = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center px-2 relative z-10">
      {/* Frosted glass bubble */}
      <div className="w-full bg-white/[0.06] border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm shadow-inner">
        {/* Opening decorative quote */}
        <span className="block text-[var(--color-accent)] text-2xl leading-none mb-1 opacity-60 font-serif select-none">
          «
        </span>
        <p className="text-[15px] text-white/80 leading-relaxed font-medium italic text-center">{text}</p>
        {/* Closing decorative quote */}
        <span className="block text-[var(--color-accent)] text-2xl leading-none mt-1 text-right opacity-60 font-serif select-none">
          »
        </span>
      </div>

      {/* Sender + date attribution */}
      <p className="mt-3 text-[11px] text-white/40 tracking-wide text-center">
        {t.giftBack.from} {senderName} • {dateStr}
      </p>
    </div>
  );
}
