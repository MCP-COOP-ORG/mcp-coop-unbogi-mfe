import type { Holiday } from '@unbogi/shared';
import { GIFT_CONFIG } from '@unbogi/shared';
import { ChevronDown, Gift, X } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, type TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Input } from '@/shared/ui';
import { colors } from '@/theme';

const ITEM_HEIGHT = 50;

interface HolidayDropdownProps {
  inputRef: React.RefObject<TextInput | null>;
  value: string;
  onChangeText: (val: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onRightIconPress: () => void;
  showDropdown: boolean;
  holidays: Holiday[];
  onSelect: (id: string, name: string) => void;
  error?: string;
}

export function HolidayDropdown({
  inputRef,
  value,
  onChangeText,
  onFocus,
  onBlur,
  onRightIconPress,
  showDropdown,
  holidays,
  onSelect,
  error,
}: HolidayDropdownProps) {
  return (
    <View style={styles.container}>
      <Input
        ref={inputRef}
        leftIcon={<Gift color={colors.ink} size={24} strokeWidth={2.5} />}
        rightIcon={
          showDropdown ? (
            <X color={colors.ink} size={20} strokeWidth={2.5} />
          ) : (
            <ChevronDown color={colors.ink} size={20} strokeWidth={2.5} />
          )
        }
        onRightIconPress={onRightIconPress}
        placeholder="Select holiday"
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        autoCapitalize="none"
        autoCorrect={false}
        error={error}
      />
      {showDropdown && holidays.length > 0 && (
        <Animated.View entering={FadeIn} style={styles.dropdownContainer}>
          <ScrollView
            style={{ maxHeight: GIFT_CONFIG.CONTACT_DROPDOWN_VISIBLE_ROWS * ITEM_HEIGHT }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {holidays.map((h) => (
              <Pressable key={h.id} style={styles.dropdownItem} onPress={() => onSelect(h.id, h.name)}>
                <Text style={styles.dropdownItemText}>{h.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
    elevation: 10,
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
