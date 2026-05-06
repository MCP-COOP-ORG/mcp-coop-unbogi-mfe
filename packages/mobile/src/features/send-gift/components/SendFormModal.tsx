import { Gift, Search } from 'lucide-react-native';
import { useEffect } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Spinner, Textarea } from '@/shared/ui';
import { useModalStore } from '@/store';
import { colors } from '@/theme';
import { useSendGiftForm } from '../hooks/useSendGiftForm';
import { CodeScannerField } from './CodeScannerField';
import { DatePickerField } from './DatePickerField';
import { SearchSelect } from './SearchSelect';

const t = {
  title: 'SEND A GIFT',
  cancel: 'Cancel',
  send: 'Send',
};

/** Thin orchestrator — assembles sub-components, delegates logic to useSendGiftForm */
export function SendFormModal() {
  const activeModal = useModalStore((s) => s.activeModal);
  const isOpen = activeModal === 'send';

  const {
    state,
    errors,
    submitting,
    isLoading,
    isFormValid,
    filteredContacts,
    showDropdown,
    setShowDropdown,
    contactInputRef,
    handleSearchChange,
    handleSelectContact,
    filteredHolidays,
    showHolidayDropdown,
    setShowHolidayDropdown,
    holidaySearch,
    holidayInputRef,
    handleHolidaySearchChange,
    handleSelectHoliday,
    showDatePicker,
    setShowDatePicker,
    handleDateChange,
    hasScannedCode,
    handleScanQr,
    handleClearScannedCode,
    handlePayloadChange,
    handleClose,
    handleSubmit,
    setGreeting,
  } = useSendGiftForm();

  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!isOpen) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });
    return () => sub.remove();
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 99999, elevation: 99999 }]}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <Animated.View
          entering={SlideInDown.springify().damping(25).stiffness(200)}
          style={[styles.modalContainer, { paddingTop: insets.top }]}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Spinner size={32} />
            </View>
          ) : (
            <View style={styles.flex1}>
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex1}>
                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Contact Search */}
                  <SearchSelect
                    inputRef={contactInputRef}
                    value={state.searchQuery}
                    onChangeText={handleSearchChange}
                    onFocus={() => {
                      if (state.receiverId) {
                        handleSearchChange('');
                      }
                    }}
                    showDropdown={showDropdown}
                    setShowDropdown={setShowDropdown}
                    data={filteredContacts}
                    displayKey="displayName"
                    onSelect={(c) => handleSelectContact(c.id, c.displayName)}
                    leftIcon={<Search color={colors.ink} size={24} strokeWidth={2.5} />}
                    placeholder="Search friend..."
                    error={errors.receiverId}
                    containerStyle={{ zIndex: 20 }}
                    dropdownVisible={!state.receiverId}
                  />

                  {/* Holiday Search */}
                  <SearchSelect
                    inputRef={holidayInputRef}
                    value={holidaySearch}
                    onChangeText={handleHolidaySearchChange}
                    onFocus={() => {
                      if (state.holidayId) {
                        handleHolidaySearchChange('');
                      }
                    }}
                    showDropdown={showHolidayDropdown}
                    setShowDropdown={setShowHolidayDropdown}
                    data={filteredHolidays}
                    displayKey="name"
                    onSelect={(h) => handleSelectHoliday(h.id, h.name)}
                    leftIcon={<Gift color={colors.ink} size={24} strokeWidth={2.5} />}
                    placeholder="Select holiday"
                    error={errors.holidayId}
                    containerStyle={{ zIndex: 10 }}
                  />

                  {/* Greeting */}
                  <View style={styles.fieldContainer}>
                    <Textarea
                      placeholder="Write a warm greeting..."
                      value={state.greeting}
                      onChangeText={setGreeting}
                      maxLength={250}
                      currentLength={state.greeting.length}
                      style={{ minHeight: 140 }}
                      error={errors.greeting}
                    />
                  </View>

                  {/* Unpack Date */}
                  <View style={styles.fieldContainer}>
                    <DatePickerField
                      value={state.unpackDate}
                      onChange={handleDateChange}
                      showPicker={showDatePicker}
                      setShowPicker={setShowDatePicker}
                      error={errors.unpackDate}
                    />
                  </View>

                  {/* Gift Code */}
                  <View style={styles.fieldContainer}>
                    <CodeScannerField
                      value={state.payloadContent}
                      hasScannedCode={hasScannedCode}
                      onChangeText={handlePayloadChange}
                      onScanQr={handleScanQr}
                      onClearScanned={handleClearScannedCode}
                      error={errors.payload}
                    />
                  </View>

                  {/* Submit Error */}
                  {errors.submit && (
                    <Animated.Text entering={FadeIn} style={styles.submitErrorText}>
                      {errors.submit}
                    </Animated.Text>
                  )}

                  {/* Footer */}
                  <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                    <Button layout="rectangle" variant="transparent" onPress={handleClose} style={styles.flex1}>
                      {t.cancel}
                    </Button>
                    <Button
                      layout="rectangle"
                      variant="lime"
                      disabled={!isFormValid}
                      status={submitting ? 'loading' : 'idle'}
                      onPress={handleSubmit}
                      style={styles.flex1}
                    >
                      {t.send}
                    </Button>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContainer: {
    width: '100%',
    flex: 1,
    backgroundColor: colors.warmBg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 0,
    flexGrow: 1,
  },
  fieldContainer: {
    position: 'relative',
    zIndex: 1,
  },
  submitErrorText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
  },
});
