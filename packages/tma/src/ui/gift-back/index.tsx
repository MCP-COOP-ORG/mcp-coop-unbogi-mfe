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
    <div className="w-full h-full bg-[#FAF6EE] border border-black rounded-[inherit] overflow-hidden">
      {/* Inner scroll container */}
      <div className="w-full h-full overflow-y-auto flex flex-col items-center text-[#1A1A1A] p-[20px]">
        <HolidayHeading name={holidayName} />

        <div className="mt-[10px] w-full">
          <GreetingBubble text={greeting} senderName={senderName} date={date} />
        </div>

        <div className="mt-[20px] w-full">
          <SecretCodeSection value={code.value} format={code.format} />
        </div>
      </div>
    </div>
  );
}
