import {
  ArrowLeft,
  Camera,
  Check,
  ChevronRight,
  Gift,
  LayoutGrid,
  Library,
  Send,
  UserPlus,
  X,
} from 'lucide-react-native';
import type React from 'react';
import { StyleSheet, Text, type TextStyle, TouchableOpacity, type ViewStyle } from 'react-native';
import { Spinner } from './Spinner';

export type ButtonVariant = 'orange' | 'red' | 'cyan' | 'lime' | 'transparent';
export type ButtonLayout = 'rectangle' | 'circle';

export interface ButtonProps {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  layout?: ButtonLayout;
  icon?:
    | 'ChevronRight'
    | 'ArrowLeft'
    | 'Check'
    | 'Send'
    | 'UserPlus'
    | 'Gift'
    | 'Library'
    | 'LayoutGrid'
    | 'Camera'
    | 'X';
  onPress?: () => void;
  disabled?: boolean;
  status?: 'idle' | 'loading' | 'disabled';
  style?: ViewStyle;
  textStyle?: TextStyle;
  isTab?: boolean;
  isActive?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  orange: '#FF8A00', // Matches TMA #F5A623 but sticking to shared theme if available
  red: '#eb2d2d',
  cyan: '#00E5FF',
  lime: '#7ab648',
  transparent: 'transparent',
};

const BUTTON_SIZE = 48; // Match Input height

const ICON_MAP = {
  ChevronRight,
  ArrowLeft,
  Check,
  Send,
  UserPlus,
  Gift,
  Library,
  LayoutGrid,
  Camera,
  X,
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'orange',
  layout = 'rectangle',
  icon,
  onPress,
  disabled,
  status = 'idle',
  style,
  textStyle,
  isTab,
  isActive,
}) => {
  const bgColor = VARIANTS[variant] || VARIANTS.orange;
  const isCircle = layout === 'circle' || isTab;
  const isDisabled = disabled || status === 'disabled';
  const isLoading = status === 'loading';

  const IconComponent = icon ? ICON_MAP[icon] : null;

  // Tab mode styling
  if (isTab) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled || isLoading}
        activeOpacity={0.8}
        style={[styles.tabContainer, isActive && { backgroundColor: bgColor }, style]}
      >
        {IconComponent && <IconComponent color={isActive ? '#1a1a1a' : '#5AABDE'} size={24} strokeWidth={2.5} />}
      </TouchableOpacity>
    );
  }

  // Normal mode
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled || isLoading}
      activeOpacity={0.8}
      style={[
        styles.container,
        isCircle ? styles.circleContainer : styles.rectangleContainer,
        { backgroundColor: bgColor },
        variant === 'transparent' && styles.transparentContainer,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <Spinner color={variant === 'transparent' ? '#1a1a1a' : '#1a1a1a'} size={24} />
      ) : (
        <>
          {children && !isCircle && (
            <Text style={[styles.text, variant === 'transparent' && styles.transparentText, textStyle]}>
              {children}
            </Text>
          )}
          {IconComponent && (
            <IconComponent color={variant === 'transparent' ? '#1a1a1a' : '#1a1a1a'} size={24} strokeWidth={2.5} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    // Neo-brutalism flat logic
    borderWidth: 2,
    borderColor: '#1a1a1a', // --color-ink
  },
  rectangleContainer: {
    height: BUTTON_SIZE,
    paddingHorizontal: 24,
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
    borderWidth: 0, // In TMA tabs have no border, just background pill
  },
  text: {
    color: '#1a1a1a', // --color-ink
    fontWeight: '800',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  transparentText: {
    color: 'rgba(43, 42, 44, 0.8)', // from TMA
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  disabled: {
    opacity: 0.5,
  },
});
