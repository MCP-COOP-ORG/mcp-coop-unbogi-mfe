import React from 'react';
import { Pressable, StyleSheet, Text, type TextStyle, type ViewStyle } from 'react-native';
import { colors, fontSizes, iconDefaults, neoBrut, spacing } from '@/theme';
import { Spinner } from './spinner';

// ── Types ───────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'orange' | 'red' | 'cyan' | 'lime' | 'transparent';
export type ButtonLayout = 'rectangle' | 'circle';

/** Props accepted by icon components passed to Button */
export interface ButtonIconProps {
  size: number;
  color: string;
  strokeWidth: number;
}

export interface ButtonProps {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  layout?: ButtonLayout;
  /** Pass any icon component: `icon={ChevronRight}` */
  icon?: React.ComponentType<ButtonIconProps>;
  onPress?: () => void;
  disabled?: boolean;
  status?: 'idle' | 'loading' | 'disabled';
  style?: ViewStyle;
  textStyle?: TextStyle;
  /** Tab mode — renders a compact pill button for BottomNav */
  isTab?: boolean;
  /** Whether this tab is currently active */
  isActive?: boolean;
}

// ── Variant → background color map ──────────────────────────────────────────────

const VARIANT_COLORS: Record<ButtonVariant, string> = {
  orange: colors.buttonOrange,
  red: colors.buttonRed,
  cyan: colors.buttonCyan,
  lime: colors.buttonLime,
  transparent: 'transparent',
};

const BUTTON_SIZE = 48;

// ── Component ───────────────────────────────────────────────────────────────────

function ButtonComponent({
  children,
  variant = 'orange',
  layout = 'rectangle',
  icon: IconComponent,
  onPress,
  disabled,
  status = 'idle',
  style,
  textStyle,
  isTab,
  isActive,
}: ButtonProps) {
  const bgColor = VARIANT_COLORS[variant];
  const isCircle = layout === 'circle' || isTab;
  const isDisabled = disabled || status === 'disabled';
  const isLoading = status === 'loading';

  // ── Tab mode ──
  if (isTab) {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled || isLoading}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled || isLoading, selected: isActive }}
        style={[styles.tabContainer, isActive && { backgroundColor: bgColor }, style]}
      >
        {IconComponent && (
          <IconComponent
            color={isActive ? colors.ink : colors.tabInactive}
            size={iconDefaults.size}
            strokeWidth={iconDefaults.strokeWidth}
          />
        )}
      </Pressable>
    );
  }

  // ── Normal mode ──
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled || isLoading}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled || isLoading }}
      style={({ pressed }) => [
        styles.container,
        isCircle ? styles.circleContainer : styles.rectangleContainer,
        { backgroundColor: bgColor },
        variant === 'transparent' && styles.transparentContainer,
        isDisabled && styles.disabled,
        pressed && !isLoading && neoBrut.buttonPressed,
        style,
      ]}
    >
      {isLoading ? (
        <Spinner color={colors.ink} size={iconDefaults.size} />
      ) : (
        <>
          {children && !isCircle && (
            <Text style={[styles.text, variant === 'transparent' && styles.transparentText, textStyle]}>
              {children}
            </Text>
          )}
          {IconComponent && (
            <IconComponent color={colors.ink} size={iconDefaults.size} strokeWidth={iconDefaults.strokeWidth} />
          )}
        </>
      )}
    </Pressable>
  );
}

export const Button = React.memo(ButtonComponent);

// ── Styles ──────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: colors.ink,
  },
  rectangleContainer: {
    height: BUTTON_SIZE,
    paddingHorizontal: spacing.lg,
    borderRadius: BUTTON_SIZE / 2,
  },
  circleContainer: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    paddingHorizontal: 0,
  },
  transparentContainer: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  tabContainer: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: 0,
  },
  text: {
    color: colors.ink,
    fontWeight: '800',
    fontSize: fontSizes.md,
    textTransform: 'uppercase',
  },
  transparentText: {
    color: colors.textMuted80,
  },
  disabled: {
    opacity: 0.5,
  },
});
