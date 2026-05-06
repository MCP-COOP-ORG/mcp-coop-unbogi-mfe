import { GIFT_CONFIG } from '@unbogi/shared';
import { ChevronDown, X } from 'lucide-react-native';
import type React from 'react';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, type TextInput, type ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Input } from '@/shared/ui';
import { colors } from '@/theme';

const ITEM_HEIGHT = 50;

interface SearchSelectProps<T> {
  inputRef: React.RefObject<TextInput | null>;
  value: string;
  onChangeText: (val: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  showDropdown: boolean;
  setShowDropdown: (v: boolean) => void;
  data: T[];
  displayKey: keyof T;
  onSelect: (item: T) => void;
  leftIcon: React.ReactNode;
  placeholder: string;
  error?: string;
  containerStyle?: ViewStyle;
  dropdownVisible?: boolean; // additional flag to hide dropdown even if showDropdown is true (e.g. hasSelected)
}

export function SearchSelect<T extends { id: string }>({
  inputRef,
  value,
  onChangeText,
  onFocus,
  onBlur,
  showDropdown,
  setShowDropdown,
  data,
  displayKey,
  onSelect,
  leftIcon,
  placeholder,
  error,
  containerStyle,
  dropdownVisible = true,
}: SearchSelectProps<T>) {
  const handleRightIconPress = useCallback(() => {
    if (showDropdown) {
      // Clear and close
      onChangeText('');
      inputRef.current?.blur();
      setShowDropdown(false);
    } else {
      // Open and focus
      inputRef.current?.focus();
      setShowDropdown(true);
    }
  }, [showDropdown, onChangeText, inputRef, setShowDropdown]);

  const handleFocus = useCallback(() => {
    setShowDropdown(true);
    onFocus?.();
  }, [setShowDropdown, onFocus]);

  const handleBlur = useCallback(() => {
    // Small delay to allow onPress of the item to fire
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
    onBlur?.();
  }, [setShowDropdown, onBlur]);

  const isDropdownActive = showDropdown && dropdownVisible && data.length > 0;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Input
        ref={inputRef}
        leftIcon={leftIcon}
        rightIcon={
          showDropdown ? (
            <X color={colors.ink} size={20} strokeWidth={2.5} />
          ) : (
            <ChevronDown color={colors.ink} size={20} strokeWidth={2.5} />
          )
        }
        onRightIconPress={handleRightIconPress}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoCapitalize="none"
        autoCorrect={false}
        error={error}
      />
      {isDropdownActive && (
        <Animated.View entering={FadeIn} style={styles.dropdownContainer}>
          <ScrollView
            style={{ maxHeight: GIFT_CONFIG.CONTACT_DROPDOWN_VISIBLE_ROWS * ITEM_HEIGHT }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {data.map((item) => (
              <Pressable
                key={item.id}
                style={styles.dropdownItem}
                onPress={() => {
                  onSelect(item);
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{String(item[displayKey])}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: colors.warmBg,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: 4,
    zIndex: 50,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textBrown,
  },
});
