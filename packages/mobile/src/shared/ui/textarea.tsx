import React from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { colors, fontSizes, neoBrut, sizing, spacing } from '@/theme';

export interface TextareaProps extends TextInputProps {
  error?: string | null;
  currentLength?: number;
  maxLength?: number;
}

export const Textarea = React.forwardRef<TextInput, TextareaProps>(
  ({ style, error, currentLength, maxLength, ...props }, ref) => {
    return (
      <View style={styles.container}>
        <View style={[styles.wrapper, error && styles.wrapperError]}>
          <TextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor={colors.placeholder}
            multiline
            textAlignVertical="top"
            maxLength={maxLength}
            {...props}
          />
          {maxLength !== undefined && currentLength !== undefined && (
            <Text style={styles.counterText}>
              {currentLength} / {maxLength}
            </Text>
          )}
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
  wrapper: {
    position: 'relative',
    borderWidth: 2,
    borderColor: colors.fieldBorder,
    backgroundColor: colors.fieldBg,
    borderRadius: spacing.md,
    minHeight: sizing.textareaMinHeight,
    padding: spacing.md,
  },
  wrapperError: {
    ...neoBrut.fieldError,
  },
  input: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.ink,
    fontWeight: '500',
    minHeight: sizing.textareaInputMinHeight,
  },
  counterText: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm + 4,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.muted,
  },
  errorText: {
    marginTop: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.errorRed,
    fontWeight: '600',
  },
});
