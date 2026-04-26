import { APP_CONFIG } from '@unbogi/shared';
import { useEffect, useState } from 'react';
import { useT } from '@/hooks/use-t';
import { ASSETS } from '@/lib/assets';

export interface LockOverlayProps {
  lockedUntil: Date;
}

export function LockOverlay({ lockedUntil }: LockOverlayProps) {
  const t = useT();
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);

  useEffect(() => {
    if (!lockedUntil) return;
    const update = () => setTimeLeftMs(Math.max(0, new Date(lockedUntil).getTime() - Date.now()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
  };

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString(APP_CONFIG.DEFAULT_LOCALE, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  if (timeLeftMs <= 0) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-auto rounded-[inherit] overflow-hidden flex flex-col items-center justify-center">
      {/* Logo */}
      <div
        className="w-[160px] h-[160px] bg-contain bg-center bg-no-repeat shrink-0"
        style={{ backgroundImage: `url(${ASSETS.LOGO})` }}
      />

      {/* Unlock date */}
      <p
        className="text-[10px] uppercase tracking-[0.15em] font-bold mt-2"
        style={{ color: 'rgb(43, 42, 44)', textShadow: 'rgba(255,255,255,0.8) 0px 1px 3px' }}
      >
        {t.surprises.canBeUnpacked.replace('{{date}}', formatDate(lockedUntil))}
      </p>

      {/* Countdown */}
      <p
        className="text-[20px] uppercase tracking-[0.05em] font-bold leading-none mt-1"
        style={{ color: 'rgb(43, 42, 44)', textShadow: 'rgba(255,255,255,0.8) 0px 1px 3px' }}
      >
        {formatTime(timeLeftMs)}
      </p>
    </div>
  );
}
