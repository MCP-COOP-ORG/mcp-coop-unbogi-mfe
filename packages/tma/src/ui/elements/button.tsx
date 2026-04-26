import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowLeftRight,
  Camera,
  Check,
  ChevronRight,
  Gift,
  LayoutGrid,
  Library,
  type LucideIcon,
  RefreshCw,
  Send,
  UserPlus,
} from 'lucide-react';
import React, { type ComponentProps } from 'react';
import { LoadingSpinner } from '../utils/spinner';

export type ButtonVariant = 'orange' | 'red' | 'cyan' | 'lime' | 'transparent';
export type ButtonStatus = 'idle' | 'loading' | 'disabled';
export type ButtonIcon =
  | 'ChevronRight'
  | 'Check'
  | 'ArrowLeft'
  | 'ArrowLeftRight'
  | 'Camera'
  | 'RefreshCw'
  | 'Send'
  | 'UserPlus'
  | 'Gift'
  | 'Library'
  | 'LayoutGrid';

const ICON_MAP: Record<ButtonIcon, LucideIcon> = {
  ChevronRight,
  Check,
  ArrowLeft,
  ArrowLeftRight,
  Camera,
  RefreshCw,
  Send,
  UserPlus,
  Gift,
  Library,
  LayoutGrid,
};

// ── Discriminated Union Props ────────────────────────────────────────────────
// Two mutually exclusive modes: Tab mode (with layoutId + isActive)
// and Normal mode (circle/pill layout without layoutId).

type MotionButtonBase = Omit<ComponentProps<typeof motion.button>, 'variant' | 'layout'>;

interface ButtonPropsBase extends MotionButtonBase {
  variant?: ButtonVariant;
  /**
   * Controls the button's interactive state.
   * - `'idle'`     — normal, interactive.
   * - `'loading'`  — shows built-in spinner, non-interactive, full opacity.
   * - `'disabled'` — non-interactive, dimmed to 0.6 opacity.
   *
   * Prefer `status` over the native `disabled` prop.
   */
  status?: ButtonStatus;
  icon?: ButtonIcon;
}

/** Tab mode — transparent hitbox with animated sliding background via layoutId. */
interface TabButtonProps extends ButtonPropsBase {
  layoutId: string;
  isActive?: boolean;
  layout?: never;
  children?: never;
}

/** Normal mode — circle or pill button with optional text content. */
interface NormalButtonProps extends ButtonPropsBase {
  layout?: 'circle' | 'pill';
  /** Text content only. Never pass JSX icons — use the `icon` prop instead. */
  children?: React.ReactNode;
  layoutId?: never;
  isActive?: never;
}

export type ButtonProps = TabButtonProps | NormalButtonProps;

// Press: subtle translate for tactile feel; glow fades out on press.
// Shadow stack (inside→out): fill → B1(black) → W(white) → B2(black) → colored ambient glow.
const B1 = 1; // inner black line px
const W = 2; // white ring px
const B2 = 1; // outer black border px
const T = B1 + W + B2; // total spread = 5px

const makeGlow = (rgba: string) => ({
  normalShadow: `0 0 0 ${B1}px #1A1A1A, 0 0 0 ${B1 + W}px #FFFFFF, 0 0 0 ${T}px #1A1A1A, 0 5px 8px 2px ${rgba}`,
  pressedShadow: `0 0 0 ${B1}px #1A1A1A, 0 0 0 ${B1}px #FFFFFF, 0 0 0 ${B1 + 1}px #1A1A1A, 0 0px 0px 0px ${rgba}`,
});

/** Single source of truth for circle button / tab button size in px. */
export const BUTTON_SIZE = 42;

export const buttonTheme: Record<ButtonVariant, { bg: string; normalShadow: string; pressedShadow: string }> = {
  orange: { bg: '#F5A623', ...makeGlow('rgba(245,166,35,0.55)') },
  red: { bg: '#E05252', ...makeGlow('rgba(224,82,82,0.55)') },
  cyan: { bg: '#5AABDE', ...makeGlow('rgba(90,171,222,0.55)') },
  lime: { bg: '#7AB648', ...makeGlow('rgba(122,182,72,0.55)') },
  transparent: { bg: 'transparent', normalShadow: 'none', pressedShadow: 'none' },
};

/** Type guard: does this props set represent tab mode? */
function isTabMode(props: ButtonProps): props is TabButtonProps {
  return 'layoutId' in props && typeof props.layoutId === 'string';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      variant = 'orange',
      status = 'idle',
      icon,
      className,
      disabled,
    } = props;

    const isLoading = status === 'loading';
    const isDisabled = status === 'disabled' || disabled || isLoading;

    const t = buttonTheme[variant];
    const IconComponent = icon ? ICON_MAP[icon] : null;

    const isTransparent = variant === 'transparent';
    const textColor = isTransparent ? 'rgba(43, 42, 44, 0.8)' : '#1A1A1A';
    const textShadow = isTransparent ? '0 1px 3px rgba(255, 255, 255, 0.8)' : undefined;

    // ── Tab mode ────────────────────────────────────────────────────────────
    if (isTabMode(props)) {
      const { layoutId, isActive, variant: _v, status: _s, icon: _i, className: _c, disabled: _d, ...tabRest } = props;
      return (
        <motion.button
          ref={ref}
          disabled={isDisabled}
          whileTap={isDisabled ? undefined : { scale: 0.92, filter: 'brightness(0.88)' }}
          transition={{ type: 'spring', stiffness: 600, damping: 20 }}
          style={{
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            backgroundColor: 'transparent',
            position: 'relative',
            WebkitTapHighlightColor: 'transparent',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
          }}
          className="flex items-center justify-center rounded-full outline-none select-none"
          {...tabRest}
        >
          {isActive && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 rounded-full"
              initial={{ background: t.bg, boxShadow: t.normalShadow }}
              animate={{ background: t.bg, boxShadow: t.normalShadow }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            />
          )}
          {IconComponent && (
            <IconComponent
              size={24}
              color={isActive ? '#1A1A1A' : '#5AABDE'}
              strokeWidth={2.5}
              fill="none"
              style={{ position: 'relative', zIndex: 10 }}
            />
          )}
        </motion.button>
      );
    }

    // ── Normal mode ─────────────────────────────────────────────────────────
    const { layout = 'circle', children, variant: _v, status: _s, icon: _i, className: _c, disabled: _d, ...normalRest } = props as NormalButtonProps;
    const isCircle = layout === 'circle';

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        initial="normal"
        animate="normal"
        whileTap={isDisabled ? undefined : 'pressed'}
        variants={{
          normal: { boxShadow: t.normalShadow, scale: 1, filter: 'brightness(1)' },
          pressed: {
            boxShadow: t.pressedShadow,
            scale: isTransparent ? 0.94 : 0.92,
            filter: isTransparent ? 'brightness(0.65)' : 'brightness(0.88)',
          },
        }}
        transition={{ type: 'spring', stiffness: 600, damping: 20 }}
        style={{
          backgroundColor: t.bg,
          width: isCircle ? BUTTON_SIZE : '100%',
          height: BUTTON_SIZE,
          WebkitTapHighlightColor: 'transparent',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: !isLoading && (status === 'disabled' || disabled) ? 0.6 : 1,
          color: textColor,
          textShadow,
        }}
        className={`relative flex items-center justify-center gap-2 outline-none select-none overflow-visible ${
          isCircle
            ? 'rounded-full'
            : isTransparent
              ? 'rounded-[28px] px-5 text-[14px] font-bold uppercase tracking-[0.15em]'
              : 'rounded-[28px] px-5 text-[17px] font-bold tracking-wide'
        } ${className || ''}`}
        {...normalRest}
      >
        {isCircle ? (
          // Circle: spinner replaces icon
          isLoading ? (
            <LoadingSpinner size={24} color={textColor} />
          ) : (
            IconComponent && <IconComponent size={24} color={textColor} strokeWidth={2.5} fill="none" />
          )
        ) : // Pill: spinner replaces text+icon; idle = text then icon inline
        isLoading ? (
          <LoadingSpinner size={20} color={textColor} />
        ) : (
          <>
            {children && <span>{children}</span>}
            {IconComponent && <IconComponent size={20} color={textColor} strokeWidth={2.5} fill="none" />}
          </>
        )}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
