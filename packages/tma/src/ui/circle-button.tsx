import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Gift,
  LayoutGrid,
  Library,
  type LucideIcon,
  Send,
  UserPlus,
} from 'lucide-react';
import React, { type ComponentProps } from 'react';

export type CircleButtonVariant = 'orange' | 'red' | 'cyan' | 'lime' | 'gray';
export type CircleButtonIcon =
  | 'ChevronRight'
  | 'Check'
  | 'ArrowLeft'
  | 'Send'
  | 'UserPlus'
  | 'Gift'
  | 'Library'
  | 'LayoutGrid';

const ICON_MAP: Record<CircleButtonIcon, LucideIcon> = {
  ChevronRight,
  Check,
  ArrowLeft,
  Send,
  UserPlus,
  Gift,
  Library,
  LayoutGrid,
};

interface CircleButtonProps extends Omit<ComponentProps<typeof motion.button>, 'variant'> {
  variant?: CircleButtonVariant;
  icon?: CircleButtonIcon;
}

export const circleButtonTheme = {
  orange: {
    bg: '#FFB870',
    normalShadow:
      '0px 8px 16px rgba(0,0,0,0.15), 0px 2px 4px rgba(0,0,0,0.1), inset 0px 2px 4px rgba(255,255,255,0.9), inset 0px -4px 8px rgba(200,90,0,0.3)',
    pressedShadow:
      '0px 2px 4px rgba(0,0,0,0.05), inset 0px 4px 8px rgba(180,80,0,0.4), inset 0px 8px 16px rgba(180,80,0,0.2)',
  },
  red: {
    bg: '#FF9494',
    normalShadow:
      '0px 8px 16px rgba(0,0,0,0.15), 0px 2px 4px rgba(0,0,0,0.1), inset 0px 2px 4px rgba(255,255,255,0.9), inset 0px -4px 8px rgba(200,40,40,0.3)',
    pressedShadow:
      '0px 2px 4px rgba(0,0,0,0.05), inset 0px 4px 8px rgba(180,30,30,0.4), inset 0px 8px 16px rgba(180,30,30,0.2)',
  },
  cyan: {
    bg: '#63D2D6',
    normalShadow:
      '0px 8px 16px rgba(0,0,0,0.15), 0px 2px 4px rgba(0,0,0,0.1), inset 0px 2px 4px rgba(255,255,255,0.9), inset 0px -4px 8px rgba(0,120,120,0.3)',
    pressedShadow:
      '0px 2px 4px rgba(0,0,0,0.05), inset 0px 4px 8px rgba(0,100,100,0.4), inset 0px 8px 16px rgba(0,100,100,0.2)',
  },
  lime: {
    bg: '#A3E635',
    normalShadow:
      '0px 8px 16px rgba(0,0,0,0.15), 0px 2px 4px rgba(0,0,0,0.1), inset 0px 2px 4px rgba(255,255,255,0.9), inset 0px -4px 8px rgba(100,160,0,0.3)',
    pressedShadow:
      '0px 2px 4px rgba(0,0,0,0.05), inset 0px 4px 8px rgba(80,140,0,0.4), inset 0px 8px 16px rgba(80,140,0,0.2)',
  },
  gray: {
    bg: '#A1A1AA',
    normalShadow:
      '0px 8px 16px rgba(0,0,0,0.15), 0px 2px 4px rgba(0,0,0,0.1), inset 0px 2px 4px rgba(255,255,255,0.9), inset 0px -4px 8px rgba(80,80,80,0.3)',
    pressedShadow:
      '0px 2px 4px rgba(0,0,0,0.05), inset 0px 4px 8px rgba(80,80,80,0.4), inset 0px 8px 16px rgba(80,80,80,0.2)',
  },
};

export const CircleButton = React.forwardRef<HTMLButtonElement, CircleButtonProps>(
  ({ variant = 'orange', icon, className, disabled, ...props }, ref) => {
    // If disabled, we force the gray variant for styling
    const activeVariant = disabled ? 'gray' : variant;
    const t = circleButtonTheme[activeVariant];
    const IconComponent = icon ? ICON_MAP[icon] : null;

    const currentBg = t.bg;
    const currentNormalShadow = t.normalShadow;
    const currentPressedShadow = disabled ? currentNormalShadow : t.pressedShadow;
    const currentIconColor = '#FFFFFF';
    const currentIconShadow = disabled ? 'none' : 'drop-shadow(0px 1px 2px rgba(0,0,0,0.25))';

    return (
      <motion.button
        ref={ref}
        disabled={disabled}
        initial="normal"
        animate="normal"
        whileTap={disabled ? undefined : 'pressed'}
        variants={{
          normal: {
            boxShadow: currentNormalShadow,
            scale: 1,
          },
          pressed: {
            boxShadow: currentPressedShadow,
            scale: 0.92,
          },
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{
          backgroundColor: currentBg,
          width: 48,
          height: 48,
          WebkitTapHighlightColor: 'transparent',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.7 : 1,
        }}
        className={`relative flex items-center justify-center rounded-full outline-none select-none overflow-visible ${className || ''}`}
        {...props}
      >
        {IconComponent && (
          <IconComponent
            size={28}
            color={currentIconColor}
            strokeWidth={2}
            fill="none"
            style={{ filter: currentIconShadow }}
          />
        )}
      </motion.button>
    );
  },
);

CircleButton.displayName = 'CircleButton';
