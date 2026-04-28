import type React from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

export interface TextareaProps extends TextInputProps {
  error?: string | null;
  currentLength?: number;
  maxLength?: number;
}

export const Textarea: React.FC<TextareaProps> = ({ style, error, currentLength, maxLength, ...props }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.wrapper, error && styles.wrapperError]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#a1a1aa" // --color-muted
          autoCapitalize="none"
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
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  wrapper: {
    position: 'relative',
    // Neo-brutalism
    borderWidth: 2,
    borderColor: '#1a1a1a', // ink
    backgroundColor: '#faf6ee', // warm-bg
    borderRadius: 16,
    minHeight: 120,
    padding: 16,
  },
  wrapperError: {
    borderColor: '#eb2d2d', // error-red
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
    minHeight: 88,
  },
  counterText: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 11,
    fontWeight: '700',
    color: '#a1a1aa',
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#eb2d2d',
    fontWeight: '600',
  },
});
