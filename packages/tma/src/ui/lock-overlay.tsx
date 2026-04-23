import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { useT } from '@/hooks/use-t';

export interface LockOverlayProps {
  lockedUntil: Date;
  senderName?: string;
}

export function LockOverlay({ lockedUntil, senderName }: LockOverlayProps) {
  const t = useT();
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);

  useEffect(() => {
    if (!lockedUntil) return;
    const updateTime = () => {
      const remaining = Math.max(0, new Date(lockedUntil).getTime() - Date.now());
      setTimeLeftMs(remaining);
    };
    updateTime();
    const timerId = setInterval(updateTime, 1000);
    return () => clearInterval(timerId);
  }, [lockedUntil]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (timeLeftMs <= 0) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-auto rounded-[inherit] overflow-hidden">
      {/* Sender + timer — top right, no backdrop */}
      <div className="absolute top-4 right-5 flex flex-col items-end text-right drop-shadow-md">
        {senderName && (
          <div className="text-[13px] font-semibold text-white/90 mb-1 leading-tight">
            {t.surprises.fromSender.replace('{{name}}', senderName)}
          </div>
        )}

        <div className="text-[11px] font-medium text-white/70 mb-2 max-w-[160px]">
          {t.surprises.canBeUnpacked.replace('{{date}}', formatDate(lockedUntil))}
        </div>

        <div className="flex items-center gap-1.5 opacity-90 mb-0.5">
          <Lock size={12} strokeWidth={2} className="text-white/80" />
          <div className="text-[16px] font-mono font-semibold tracking-tight text-white leading-none">
            {formatTime(timeLeftMs)}
          </div>
        </div>
      </div>
    </div>
  );
}
