import type { ScratchCodeFormat } from '@unbogi/shared';
import { QRCodeSVG } from 'qrcode.react';
import { useT } from '@/hooks/use-t';

interface SecretCodeSectionProps {
  value: string;
  format: ScratchCodeFormat;
}

export function SecretCodeSection({ value, format }: SecretCodeSectionProps) {
  const t = useT();

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
  };

  return (
    <div className="w-full flex flex-col items-center pb-8">
      {/* Section label */}
      <div className="text-[10px] uppercase tracking-[0.15em] rounded-full border border-black/30 px-4 py-1.5 font-bold text-[#1A1A1A]/60 mb-4">
        {t.giftBack.activationCode}
      </div>

      {format === 'qr' ? (
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
            {value}
          </button>
          <p className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest">{t.giftBack.tapToCopy}</p>
        </div>
      )}
    </div>
  );
}
