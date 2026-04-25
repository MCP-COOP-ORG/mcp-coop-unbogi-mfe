import { APP_CONFIG } from '@unbogi/shared';

interface GreetingBubbleProps {
  text: string;
  senderName: string;
  date: Date;
}

export function GreetingBubble({ text, senderName, date }: GreetingBubbleProps) {
  const dateStr = date.toLocaleDateString(APP_CONFIG.DEFAULT_LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="w-full flex-1 flex flex-col px-1">
      {/* Message */}
      <p className="text-[15px] text-[#1A1A1A]/80 leading-relaxed font-medium italic text-left">{text}</p>

      {/* Author — bottom-right */}
      <p className="text-right mt-[10px] leading-tight">
        <span className="block font-semibold text-[13px] text-[#1A1A1A]/75 italic">{senderName}</span>
        <span className="text-[11px] text-[#1A1A1A]/45 tracking-wide">{dateStr}</span>
      </p>
    </div>
  );
}
