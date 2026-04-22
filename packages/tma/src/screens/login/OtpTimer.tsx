import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';
import { OTP_CONFIG } from '@unbogi/shared';

interface OtpTimerProps {
  sentAt: number;
  onExpired: () => void;
}

/**
 * Иконка таймера с обратным отсчётом.
 * Используется как icon-prop для Input компонента вместо иконки письма.
 * При истечении показывает сообщение и вызывает onExpired.
 */
export function OtpTimer({ sentAt, onExpired }: OtpTimerProps) {
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, sentAt + OTP_CONFIG.LIFETIME_MS - Date.now()),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const ms = Math.max(0, sentAt + OTP_CONFIG.LIFETIME_MS - Date.now());
      setRemainingMs(ms);
      if (ms === 0) {
        clearInterval(interval);
        onExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sentAt, onExpired]);

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const label = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <span className="text-[11px] font-mono text-purple-300/70 tabular-nums leading-none">
      {remainingMs > 0 ? label : <Timer size={14} className="text-red-400/70" />}
    </span>
  );
}
