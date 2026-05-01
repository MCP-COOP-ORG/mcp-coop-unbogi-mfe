import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { CalendarDays } from 'lucide-react-native';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Input } from '@/shared/ui';
import { colors, spacing } from '@/theme';

interface DatePickerFieldProps {
  value: string; // ISO string or ''
  onChange: (date: Date) => void;
  showPicker: boolean;
  setShowPicker: (v: boolean) => void;
  error?: string;
}

export function DatePickerField({ value, onChange, showPicker, setShowPicker, error }: DatePickerFieldProps) {
  const parsedDate = value ? new Date(value) : new Date();

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: parsedDate,
        mode: 'date',
        is24Hour: true,
        onChange: (_evt, selectedDate) => {
          if (!selectedDate) return;
          DateTimePickerAndroid.open({
            value: selectedDate,
            mode: 'time',
            is24Hour: true,
            onChange: (_evt2, selectedTime) => {
              if (!selectedTime) return;
              onChange(selectedTime);
            },
          });
        },
      });
    } else {
      setShowPicker(true);
    }
  };

  return (
    <View>
      <Pressable onPress={openPicker}>
        <View pointerEvents="none">
          <Input
            leftIcon={<CalendarDays color={colors.ink} size={24} strokeWidth={2.5} />}
            value={value ? parsedDate.toLocaleString() : ''}
            placeholder="Unpack Date & Time"
            error={error}
          />
        </View>
      </Pressable>

      {showPicker && Platform.OS === 'ios' && (
        <Modal transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <Pressable style={{ flex: 1 }} onPress={() => setShowPicker(false)} />
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerHeader}>
                <Pressable
                  onPress={() => {
                    if (!value) onChange(new Date());
                    setShowPicker(false);
                  }}
                >
                  <Text style={styles.doneText}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={parsedDate}
                mode="datetime"
                display="spinner"
                onChange={(_event, date) => {
                  if (date) onChange(date);
                }}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  iosPickerContainer: {
    backgroundColor: colors.white,
    paddingBottom: 40,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.datePickerDivider,
  },
  doneText: {
    color: colors.datePickerAction,
    fontWeight: '600',
  },
});
