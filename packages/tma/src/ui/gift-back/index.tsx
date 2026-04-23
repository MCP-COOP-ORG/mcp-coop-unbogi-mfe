import type { ScratchCodeFormat } from '@unbogi/shared';
import { GreetingBubble } from './greeting-bubble';
import { HolidayHeading } from './holiday-heading';
import { SecretCodeSection } from './secret-code-section';

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
    <div className="w-full h-full bg-[#1c1c1d] border border-white/10 flex flex-col items-center text-white relative rounded-[inherit] overflow-hidden py-6 gap-4">
      {/* Subtle radial glow at the top */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

      <HolidayHeading name={holidayName} />

      <GreetingBubble text={greeting} senderName={senderName} date={date} />

      <SecretCodeSection value={code.value} format={code.format} />
    </div>
  );
}
