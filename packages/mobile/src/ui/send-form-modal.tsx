import { GIFT_CONFIG, sendFormSchema, useContactsStore, useGiftsStore, useHolidaysStore } from '@unbogi/shared';
import { Gift, ScanLine, Search } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, SlideInDown, SlideOutDown, ZoomIn } from 'react-native-reanimated';
import { useSendModalStore } from '../store';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { formReducer, initialState, type SendFormErrorKey } from './send-form-model';
import { Textarea } from './Textarea';

// Replace this with Expo camera scanner if needed later.
// import * as ImagePicker from 'expo-image-picker';

const t = {
  title: 'SEND A GIFT',
  searchFriend: 'Search friend...',
  selectHoliday: 'Select holiday',
  greetingPlaceholder: 'Write a warm greeting...',
  unpackDate: 'Unpack Date & Time',
  codePlaceholder: 'Gift Code or URL',
  cancel: 'Cancel',
  send: 'Send',
  errorSubmit: 'Failed to send gift. Try again.',
};

const CONTACT_ITEM_HEIGHT = 50;

export function SendFormModal() {
  const { isSendModalOpen, closeSendModal } = useSendModalStore();

  /* ── data stores ── */
  const { contacts, loadContacts, isLoaded: contactsLoaded, isLoading: contactsLoading } = useContactsStore();
  const { holidays, loadHolidays, isLoaded: holidaysLoaded, isLoading: holidaysLoading } = useHolidaysStore();
  const sendGift = useGiftsStore((s) => s.sendGift);

  /* ── form state ── */
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [errors, setErrors] = useState<Partial<Record<SendFormErrorKey, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const isFormValid = Boolean(
    state.receiverId && state.holidayId && state.greeting.trim() && state.unpackDate && state.payloadContent.trim(),
  );

  /* ── bootstrap ── */
  useEffect(() => {
    if (isSendModalOpen) {
      loadContacts();
      loadHolidays();
    }
  }, [isSendModalOpen, loadContacts, loadHolidays]);

  /* ── back / close ── */
  const handleClose = useCallback(() => {
    dispatch({ type: 'RESET' });
    setErrors({});
    setShowDropdown(false);
    closeSendModal();
  }, [closeSendModal]);

  /* ── holiday options ── */
  const holidayOptions = useMemo(() => holidays.map((h) => ({ value: h.id, label: h.name })), [holidays]);

  /* ── holiday → prefill greeting ── */
  useEffect(() => {
    if (!state.holidayId) return;
    const selected = holidays.find((h) => h.id === state.holidayId);
    if (!selected?.defaultGreeting) return;
    dispatch({ type: 'SET_GREETING', payload: selected.defaultGreeting });
  }, [state.holidayId, holidays]);

  /* ── contact search ── */
  const filteredContacts = useMemo(() => {
    const query = state.searchQuery.trim();
    const source =
      query.length >= GIFT_CONFIG.CONTACT_SEARCH_MIN_CHARS
        ? contacts.filter((c) => c.displayName.toLowerCase().includes(query.toLowerCase()))
        : contacts;
    return source
      .slice()
      .sort((a, b) => {
        const key = (name: string) => name.slice(1).toLowerCase();
        return key(a.displayName).localeCompare(key(b.displayName));
      })
      .slice(0, GIFT_CONFIG.CONTACT_SEARCH_MAX_RESULTS);
  }, [contacts, state.searchQuery]);

  const handleSearchChange = (val: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: val });
    if (state.receiverId) dispatch({ type: 'SET_RECEIVER', payload: '' });
    setShowDropdown(true);
  };

  const handleSelectContact = (id: string, name: string) => {
    dispatch({ type: 'SET_RECEIVER', payload: id });
    dispatch({ type: 'SET_SEARCH_QUERY', payload: name });
    setShowDropdown(false);
  };

  /* ── QR scan ── */
  const handleScanQr = async () => {
    // TODO: implement Expo Camera / Barcode scanner for React Native
    console.log('QR code scan requested');
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    setErrors({});
    const parsed = sendFormSchema.safeParse({
      receiverId: state.receiverId,
      holidayId: state.holidayId,
      greeting: state.greeting,
      unpackDate: state.unpackDate ? new Date(state.unpackDate) : undefined,
      payload: { format: state.payloadFormat, content: state.payloadContent },
    });

    if (!parsed.success) {
      const fieldErrors: Partial<Record<SendFormErrorKey, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as SendFormErrorKey;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      await sendGift({
        idempotencyKey: crypto.randomUUID(),
        receiverId: parsed.data.receiverId,
        holidayId: parsed.data.holidayId,
        greeting: parsed.data.greeting,
        unpackDate: state.unpackDate ? new Date(state.unpackDate).toISOString() : '',
        scratchCode: { value: parsed.data.payload.content, format: parsed.data.payload.format },
      });
      handleClose();
    } catch {
      setErrors({ submit: t.errorSubmit });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── loading ── */
  const isLoading = (!contactsLoaded && contactsLoading) || (!holidaysLoaded && holidaysLoading);

  return (
    <Modal visible={isSendModalOpen} transparent animationType="fade" onRequestClose={handleClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <Animated.View
          entering={SlideInDown.springify().damping(25).stiffness(200)}
          exiting={SlideOutDown.duration(200)}
          style={styles.modalContainer}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF5A5A" />
            </View>
          ) : (
            <View style={styles.flex1}>
              <View style={styles.header}>
                <Text style={styles.title}>{t.title}</Text>
              </View>

              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {/* ── Contact Search ── */}
                <View style={styles.fieldContainer}>
                  <Input
                    leftIcon={<Search color="#1A1A1A" size={24} strokeWidth={2.5} />}
                    placeholder={t.searchFriend}
                    value={state.searchQuery}
                    onChangeText={handleSearchChange}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setShowDropdown(false)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    error={errors.receiverId}
                  />
                  {showDropdown && filteredContacts.length > 0 && !state.receiverId && (
                    <Animated.View entering={FadeIn} style={styles.dropdownContainer}>
                      <ScrollView
                        style={{ maxHeight: GIFT_CONFIG.CONTACT_DROPDOWN_VISIBLE_ROWS * CONTACT_ITEM_HEIGHT }}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled
                      >
                        {filteredContacts.map((c) => (
                          <Pressable
                            key={c.id}
                            style={styles.dropdownItem}
                            onPress={() => handleSelectContact(c.id, c.displayName)}
                          >
                            <Text style={styles.dropdownItemText}>{c.displayName}</Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </Animated.View>
                  )}
                </View>

                {/* ── Holiday Select ── */}
                <View style={[styles.fieldContainer, { zIndex: -1 }]}>
                  <Select
                    icon={<Gift color="#1A1A1A" size={24} strokeWidth={2.5} />}
                    options={holidayOptions}
                    value={state.holidayId}
                    placeholder={t.selectHoliday}
                    onChange={(val: string) => dispatch({ type: 'SET_HOLIDAY', payload: val })}
                    error={errors.holidayId}
                  />
                </View>

                {/* ── Greeting ── */}
                <View style={[styles.fieldContainer, { zIndex: -2 }]}>
                  <Textarea
                    placeholder={t.greetingPlaceholder}
                    value={state.greeting}
                    onChangeText={(val) => dispatch({ type: 'SET_GREETING', payload: val })}
                    maxLength={GIFT_CONFIG.GREETING_MAX_LENGTH}
                    error={errors.greeting}
                  />
                </View>

                {/* ── Unpack Date ── */}
                {/* Note: using simple text input for datetime in React Native as a fallback if no date picker */}
                <View style={[styles.fieldContainer, { zIndex: -3 }]}>
                  <Input
                    value={state.unpackDate}
                    onChangeText={(val) => dispatch({ type: 'SET_UNPACK_DATE', payload: val })}
                    placeholder={t.unpackDate}
                    error={errors.unpackDate}
                    // For a proper datetime, we'd use @react-native-community/datetimepicker
                    // or a custom Neo-Brutalism date picker.
                  />
                </View>

                {/* ── Gift Code ── */}
                <View style={[styles.fieldContainer, styles.rowContainer, { zIndex: -4 }]}>
                  <View style={styles.flex1}>
                    <Input
                      leftIcon={<ScanLine color="#1A1A1A" size={24} strokeWidth={2.5} />}
                      placeholder={t.codePlaceholder}
                      value={state.payloadContent}
                      onChangeText={(val) => {
                        if (state.payloadFormat !== 'code') {
                          dispatch({ type: 'SET_PAYLOAD_FORMAT', payload: 'code' });
                        }
                        dispatch({ type: 'SET_PAYLOAD_CONTENT', payload: val });
                      }}
                      error={errors.payload}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  <View style={styles.cameraButtonWrapper}>
                    <Button layout="circle" variant="orange" icon="Camera" onPress={handleScanQr} />
                  </View>
                </View>

                {/* ── Submit Error ── */}
                {errors.submit && (
                  <Animated.Text entering={FadeIn} style={styles.submitErrorText}>
                    {errors.submit}
                  </Animated.Text>
                )}
              </ScrollView>

              {/* ── Pinned bottom buttons ── */}
              <View style={styles.footer}>
                <Button layout="rectangle" variant="transparent" onPress={handleClose} style={styles.flex1}>
                  {t.cancel}
                </Button>
                <Button
                  layout="rectangle"
                  variant={isFormValid ? 'lime' : 'cyan'}
                  status={submitting ? 'loading' : 'idle'}
                  onPress={handleSubmit}
                  style={styles.flex1}
                >
                  {t.send}
                </Button>
              </View>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContainer: {
    width: '100%',
    height: '90%',
    backgroundColor: '#FFF5E1',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    // Neo-Brutalism Shadow
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#1a1a1a',
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#1A1A1A',
    backgroundColor: '#FFE0B2',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#5D4037',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  fieldContainer: {
    position: 'relative',
    zIndex: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cameraButtonWrapper: {
    marginBottom: 20, // To align with Input if there's error text space below it
  },
  dropdownContainer: {
    position: 'absolute',
    top: 60, // approx height of input
    left: 0,
    right: 0,
    backgroundColor: '#FFF5E1',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    padding: 4,
    zIndex: 50,
    // Shadow
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#5D4037',
  },
  submitErrorText: {
    color: '#FF5A5A',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 40, // extra padding for safe area
    borderTopWidth: 2,
    borderTopColor: '#1A1A1A',
    backgroundColor: '#FFF5E1',
  },
});
