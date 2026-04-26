import type { ScratchCodeFormat } from '@unbogi/shared';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { useT } from '@/hooks';
import { formatLocalDate, tg } from '@/lib';

export interface GiftBackProps {
  holidayName: string;
  greeting: string;
  senderName: string;
  date: Date;
  code: {
    value: string;
    format: ScratchCodeFormat;
  };
}

function HolidayHeading({ holidayName }: Pick<GiftBackProps, 'holidayName'>) {
  return (
    <div className="w-full text-center relative z-10">
      <h3 className="text-[#1A1A1A] text-2xl font-bold tracking-wide leading-snug">{holidayName}</h3>
    </div>
  );
}

function GreetingBubble({ greeting, senderName, date }: Pick<GiftBackProps, 'greeting' | 'senderName' | 'date'>) {
  const dateStr = formatLocalDate(date, 'full');

  return (
    <div className="w-full flex-1 flex flex-col px-1">
      {/* Message */}
      <p className="text-[15px] text-[#1A1A1A]/80 leading-relaxed font-medium italic text-left">{greeting}</p>

      {/* Author — bottom-right */}
      <p className="text-right mt-[10px] leading-tight">
        <span className="block font-semibold text-[13px] text-[#1A1A1A]/75 italic">{senderName}</span>
        <span className="text-[11px] text-[#1A1A1A]/45 tracking-wide">{dateStr}</span>
      </p>
    </div>
  );
}

function SecretCodeSection({ code: { value, format } }: Pick<GiftBackProps, 'code'>) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      tg.hapticNotification('success');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      tg.hapticNotification('error');
    }
  };

  return (
    <div className="w-full flex flex-col items-center pb-8">
      {/* Section label */}
      <div className="text-[10px] uppercase tracking-[0.15em] rounded-full border border-black/30 px-4 py-1.5 font-bold text-[#1A1A1A]/60 mb-4">
        {t.giftBack.activationCode}
      </div>

      {format === 'qr-code' ? (
        <div className="flex flex-col items-center gap-3">
          <div className="bg-white p-3 rounded-2xl border border-black/10">
            <QRCodeSVG value={value} size={152} bgColor="#ffffff" fgColor="#1A1A1A" level="M" />
          </div>
          <p className="text-[11px] text-[#1A1A1A]/50 uppercase tracking-widest">{t.giftBack.scanToActivate}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 w-full">
          <button
            type="button"
            onClick={handleCopy}
            className="text-[18px] font-mono tracking-[0.10em] font-bold text-[#FAF6EE] bg-[#1A1A1A] px-5 py-3 rounded-2xl border border-black/10 transition-all duration-150 active:scale-95 cursor-pointer select-none w-full text-center"
          >
            {copied ? <span className="text-[#7AB648]">{t.giftBack.copied}</span> : value}
          </button>
          <p className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest">{t.giftBack.tapToCopy}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Back face of the gift postcard.
 *
 * Layout (top → bottom):
 *   1. Holiday title   — centered, no icons
 *   2. Greeting bubble — message text + sender name + date
 *   3. Code section    — QR code or copyable text code
 */
export function GiftBack({ holidayName, greeting, senderName, date, code }: GiftBackProps) {
  return (
    <div className="w-full h-full bg-[#FAF6EE] border border-black rounded-[inherit] overflow-hidden">
      {/* Inner scroll container */}
      <div className="w-full h-full overflow-y-auto flex flex-col items-center text-[#1A1A1A] p-[20px]">
        <HolidayHeading holidayName={holidayName} />

        <div className="mt-[10px] w-full">
          <GreetingBubble greeting={greeting} senderName={senderName} date={date} />
        </div>

        <div className="mt-[20px] w-full">
          <SecretCodeSection code={code} />
        </div>
      </div>
    </div>
  );
}
