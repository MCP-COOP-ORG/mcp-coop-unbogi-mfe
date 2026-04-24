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

export type ButtonVariant = 'orange' | 'red' | 'cyan' | 'lime' | 'transparent';
export type ButtonIcon =
  | 'ChevronRight'
  | 'Check'
  | 'ArrowLeft'
  | 'Send'
  | 'UserPlus'
  | 'Gift'
  | 'Library'
  | 'LayoutGrid';

const ICON_MAP: Record<ButtonIcon, LucideIcon> = {
  ChevronRight,
  Check,
  ArrowLeft,
  Send,
  UserPlus,
  Gift,
  Library,
  LayoutGrid,
};

export interface ButtonProps extends Omit<ComponentProps<typeof motion.button>, 'variant' | 'layout'> {
  variant?: ButtonVariant;
  icon?: ButtonIcon;
  layout?: 'circle' | 'pill';
  children?: React.ReactNode;
}

export const buttonTheme: Record<ButtonVariant, { bg: string; normalShadow: string; pressedShadow: string }> = {
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
  transparent: {
    bg: 'transparent',
    normalShadow: 'none',
    pressedShadow: 'none',
  },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'orange', icon, layout = 'circle', className, children, disabled, ...props }, ref) => {
    const activeVariant = variant;
    const t = buttonTheme[activeVariant];
    const IconComponent = icon ? ICON_MAP[icon] : null;

    const currentBg = t.bg;
    const currentNormalShadow = t.normalShadow;
    const currentPressedShadow = disabled ? currentNormalShadow : t.pressedShadow;

    // For transparent, text color is different
    const currentTextColor = variant === 'transparent' ? '#A1A1AA' : '#FFFFFF';
    const currentIconShadow = variant === 'transparent' ? 'none' : 'drop-shadow(0px 1px 2px rgba(0,0,0,0.25))';

    const isCircle = layout === 'circle';

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
            scale: 0.96,
          },
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{
          backgroundColor: currentBg,
          width: isCircle ? 48 : '100%',
          height: isCircle ? 48 : 56,
          WebkitTapHighlightColor: 'transparent',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          color: currentTextColor,
        }}
        className={`relative flex items-center justify-center outline-none select-none overflow-visible ${
          isCircle ? 'rounded-full' : 'rounded-[28px] px-6 text-[17px] font-bold tracking-wide'
        } ${className || ''}`}
        {...props}
      >
        {IconComponent && (
          <IconComponent
            size={isCircle ? 28 : 20}
            color={currentTextColor}
            strokeWidth={2}
            fill="none"
            style={{ filter: currentIconShadow }}
            className={children ? 'mr-2' : ''}
          />
        )}
        {children && (
          <span style={{ textShadow: variant === 'transparent' ? 'none' : '0px 1px 2px rgba(0,0,0,0.2)' }}>
            {children}
          </span>
        )}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
