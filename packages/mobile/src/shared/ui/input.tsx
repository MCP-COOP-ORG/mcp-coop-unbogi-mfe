import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { colors, fontSizes, neoBrut, radii, sizing, spacing } from '@/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ style, label, error, leftIcon, rightIcon, onRightIconPress, ...props }, ref) => {
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={[styles.wrapper, error && styles.wrapperError]}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          <TextInput ref={ref} style={[styles.input, style]} placeholderTextColor={colors.placeholder} {...props} />
          {rightIcon &&
            (onRightIconPress ? (
              <Pressable style={styles.rightIconContainer} onPress={onRightIconPress} hitSlop={8}>
                {rightIcon}
              </Pressable>
            ) : (
              <View style={styles.rightIconContainer}>{rightIcon}</View>
            ))}
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: spacing.sm,
    fontSize: fontSizes.base,
    fontWeight: '700',
    color: colors.ink,
    textTransform: 'uppercase',
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.fieldBorder,
    backgroundColor: colors.fieldBg,
    borderRadius: radii.pill,
    height: sizing.inputHeight,
  },
  wrapperError: {
    ...neoBrut.fieldError,
  },
  leftIconContainer: {
    paddingLeft: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    paddingRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.md,
    color: colors.ink,
    fontWeight: '500',
  },
  errorText: {
    marginTop: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.errorRed,
    fontWeight: '600',
  },
});
