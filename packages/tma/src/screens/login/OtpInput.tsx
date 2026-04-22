import { useRef, type KeyboardEvent, type ClipboardEvent } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CELLS = 6;

/**
 * 6-ячеечный OTP ввод.
 * - Auto-focus следующей ячейки при вводе цифры
 * - Backspace возвращает фокус на предыдущую ячейку
 * - Paste поддерживает вставку всех 6 цифр сразу
 * - onChange вызывается с полной строкой (6 цифр или меньше)
 */
export function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const digits = value.split('').concat(Array(CELLS).fill('')).slice(0, CELLS);
  const refs = useRef<Array<HTMLInputElement | null>>(Array(CELLS).fill(null));

  const focus = (index: number) => {
    refs.current[index]?.focus();
  };

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return; // только цифры

    const next = [...digits];
    next[index] = char;
    const joined = next.join('');
    onChange(joined.replace(/\s/g, ''));

    if (char && index < CELLS - 1) {
      focus(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        // Стираем текущую ячейку
        handleChange(index, '');
      } else if (index > 0) {
        // Переходим назад и стираем
        focus(index - 1);
        handleChange(index - 1, '');
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focus(index - 1);
    } else if (e.key === 'ArrowRight' && index < CELLS - 1) {
      focus(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CELLS);
    if (!pasted) return;
    onChange(pasted.padEnd(CELLS, '').slice(0, CELLS).replace(/\s/g, pasted));
    onChange(pasted);
    // Фокус на последнюю заполненную ячейку
    focus(Math.min(pasted.length, CELLS - 1));
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoFocus={i === 0}
          onChange={(e) => handleChange(i, e.target.value.slice(-1))}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={[
            'w-10 h-12 text-center text-lg font-semibold',
            'rounded-xl border outline-none',
            'bg-white/[0.08] text-white',
            'transition-all duration-150',
            digit
              ? 'border-purple-400/60 bg-purple-500/10'
              : 'border-white/[0.18]',
            'focus:border-purple-400/80 focus:bg-white/[0.12]',
            'disabled:opacity-40 disabled:cursor-not-allowed',
          ].join(' ')}
        />
      ))}
    </div>
  );
}
