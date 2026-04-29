import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

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
          <TextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor="#a1a1aa"
            autoCapitalize="none"
            {...props}
          />
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
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a', // ink
    textTransform: 'uppercase',
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    // Neo-brutalism
    borderWidth: 2,
    borderColor: '#1a1a1a', // ink
    backgroundColor: '#faf6ee', // warm-bg
    borderRadius: 24, // increased to match new Button height
    height: 48, // Match button height
  },
  wrapperError: {
    borderColor: '#eb2d2d', // error-red
  },
  leftIconContainer: {
    paddingLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    paddingRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#eb2d2d',
    fontWeight: '600',
  },
});
