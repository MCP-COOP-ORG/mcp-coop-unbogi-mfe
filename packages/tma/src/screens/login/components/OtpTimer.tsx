import { OTP_CONFIG } from '@unbogi/shared';
import { Timer } from 'lucide-react';
import { useEffect, useState } from 'react';

interface OtpTimerProps {
  sentAt: number;
  onExpired: () => void;
}

/**
 * Countdown timer icon.
 * Used as an icon-prop for the Input component instead of the mail icon.
 * Calls onExpired when the timer reaches zero.
 */
export function OtpTimer({ sentAt, onExpired }: OtpTimerProps) {
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, sentAt + OTP_CONFIG.LIFETIME_MS - Date.now()));

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
    <span className="text-[12px] font-mono font-bold text-[#5D4037]/70 tabular-nums leading-none">
      {remainingMs > 0 ? label : <Timer size={14} className="text-[#FF9494]" />}
    </span>
  );
}
