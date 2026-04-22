import type { ScratchCodeFormat } from '@unbogi/shared';
import { QRCodeSVG } from 'qrcode.react';
import { useT } from '@/hooks/use-t';

interface SecretCodeSectionProps {
  value: string;
  format: ScratchCodeFormat;
}

/**
 * Activation code section — bottom of the gift back face.
 * - format === 'qr'             → real scannable QR code
 * - format === 'text' | 'link'  → copyable monospace text code
 */
export function SecretCodeSection({ value, format }: SecretCodeSectionProps) {
  const t = useT();

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
  };

  return (
    <div className="w-full flex flex-col items-center relative z-10 pb-16">
      {/* Decorative divider */}
      <div className="w-12 h-[1px] bg-white/20 mb-5 rounded-full" />

      {/* Section label */}
      <div className="text-[10px] uppercase tracking-[0.15em] rounded-full bg-white/5 border border-white/10 px-4 py-1.5 font-bold text-white/40 mb-4 shadow-sm backdrop-blur-md">
        {t.giftBack.activationCode}
      </div>

      {format === 'qr' ? (
        /* Real QR — scannable at the point of use */
        <div className="flex flex-col items-center gap-3">
          <div className="bg-white p-3 rounded-2xl shadow-2xl">
            <QRCodeSVG value={value} size={152} bgColor="#ffffff" fgColor="#1c1c1d" level="M" />
          </div>
          <p className="text-[11px] text-white/40 uppercase tracking-widest">{t.giftBack.scanToActivate}</p>
        </div>
      ) : (
        /* Text / link code — tap to copy */
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="text-[28px] md:text-3xl font-mono tracking-[0.12em] font-bold text-white bg-black/40 px-7 py-4 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md transition-all duration-150 active:scale-95 cursor-pointer select-all"
          >
            {value}
          </button>
          <p className="text-[10px] text-white/30 uppercase tracking-widest">{t.giftBack.tapToCopy}</p>
        </div>
      )}
    </div>
  );
}
