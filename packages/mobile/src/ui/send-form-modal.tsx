import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { GIFT_CONFIG, sendFormSchema, useContactsStore, useGiftsStore, useHolidaysStore } from '@unbogi/shared';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Crypto from 'expo-crypto';
import { CalendarDays, Camera, Check, ChevronDown, Gift, QrCode, ScanLine, Search, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input, Spinner, Textarea } from '@/shared/ui';
import { useSendModalStore } from '../store';
import { formReducer, initialState, type SendFormErrorKey } from './send-form-model';

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
  const [showHolidayDropdown, setShowHolidayDropdown] = useState(false);
  const [holidaySearch, setHolidaySearch] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const contactInputRef = useRef<TextInput>(null);
  const holidayInputRef = useRef<TextInput>(null);
  const scanSubscriptionRef = useRef<ReturnType<typeof CameraView.onModernBarcodeScanned> | null>(null);

  const hasScannedCode = state.payloadFormat === 'qr-code' && state.payloadContent.length > 0;

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

  /* ── cleanup scan subscription on unmount ── */
  useEffect(() => {
    return () => {
      scanSubscriptionRef.current?.remove();
    };
  }, []);

  /* ── back / close ── */
  const handleClose = useCallback(() => {
    dispatch({ type: 'RESET' });
    setErrors({});
    setShowDropdown(false);
    setShowHolidayDropdown(false);
    setHolidaySearch('');
    closeSendModal();
  }, [closeSendModal]);

  /* ── holiday filtering ── */
  const filteredHolidays = useMemo(() => {
    const query = holidaySearch.trim().toLowerCase();
    const source = query.length > 0 ? holidays.filter((h) => h.name.toLowerCase().includes(query)) : holidays;
    return source;
  }, [holidays, holidaySearch]);

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

  const handleHolidaySearchChange = (val: string) => {
    setHolidaySearch(val);
    if (state.holidayId) dispatch({ type: 'SET_HOLIDAY', payload: '' });
    setShowHolidayDropdown(true);
  };

  const handleSelectHoliday = (id: string, name: string) => {
    dispatch({ type: 'SET_HOLIDAY', payload: id });
    setHolidaySearch(name);
    setShowHolidayDropdown(false);
    holidayInputRef.current?.blur();
  };

  /* ── QR scan (Modern API — Expo SDK 55 + New Architecture) ── */
  const handleScanQr = async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) return;
    }

    // Clear any stale subscription from a previous interrupted scan
    scanSubscriptionRef.current?.remove();
    scanSubscriptionRef.current = null;

    // Subscribe BEFORE launching — listener lives in ref so it survives launchScanner resolving
    scanSubscriptionRef.current = CameraView.onModernBarcodeScanned(({ data }) => {
      if (!data || data.trim().length === 0) return;
      // Clean up listener immediately on first successful scan
      scanSubscriptionRef.current?.remove();
      scanSubscriptionRef.current = null;
      dispatch({ type: 'SET_PAYLOAD_FORMAT', payload: 'qr-code' });
      dispatch({ type: 'SET_PAYLOAD_CONTENT', payload: data });
      CameraView.dismissScanner();
    });

    // Launch native DataScannerViewController (iOS 16+) / Google Code Scanner (Android)
    // NOTE: do NOT remove subscription here — launchScanner may resolve before scan happens
    CameraView.launchScanner({ barcodeTypes: ['qr'] }).catch(console.error);
  };

  const handleClearScannedCode = () => {
    dispatch({ type: 'SET_PAYLOAD_FORMAT', payload: 'code' });
    dispatch({ type: 'SET_PAYLOAD_CONTENT', payload: '' });
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    console.log('[SendForm] handleSubmit called, isFormValid=', isFormValid, 'state=', JSON.stringify(state));
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

    const payload = {
      idempotencyKey: Crypto.randomUUID(),
      receiverId: parsed.data.receiverId,
      holidayId: parsed.data.holidayId,
      greeting: parsed.data.greeting,
      unpackDate: state.unpackDate ? new Date(state.unpackDate).toISOString() : '',
      scratchCode: { value: parsed.data.payload.content, format: parsed.data.payload.format },
    };
    console.log('[SendForm] sending payload:', JSON.stringify(payload, null, 2));
    try {
      await sendGift(payload);
      console.log('[SendForm] ✅ success');
      handleClose();
    } catch (err) {
      console.error('[SendForm] ❌ error:', err);
      setErrors({ submit: t.errorSubmit });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isSendModalOpen) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });
    return () => sub.remove();
  }, [isSendModalOpen, handleClose]);

  /* ── loading ── */
  const isLoading = (!contactsLoaded && contactsLoading) || (!holidaysLoaded && holidaysLoading);

  const insets = useSafeAreaInsets();

  if (!isSendModalOpen) return null;

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
                  {/* ── Contact Search ── */}
                  <View style={[styles.fieldContainer, showDropdown ? { zIndex: 20, elevation: 20 } : undefined]}>
                    <Input
                      ref={contactInputRef}
                      leftIcon={<Search color="#1A1A1A" size={24} strokeWidth={2.5} />}
                      rightIcon={
                        showDropdown ? (
                          <X color="#1A1A1A" size={20} strokeWidth={2.5} />
                        ) : (
                          <ChevronDown color="#1A1A1A" size={20} strokeWidth={2.5} />
                        )
                      }
                      onRightIconPress={() => {
                        if (showDropdown) {
                          contactInputRef.current?.blur();
                        } else {
                          contactInputRef.current?.focus();
                        }
                      }}
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

                  {/* ── Holiday Search ── */}
                  <View
                    style={[styles.fieldContainer, showHolidayDropdown ? { zIndex: 10, elevation: 10 } : undefined]}
                  >
                    <Input
                      ref={holidayInputRef}
                      leftIcon={<Gift color="#1A1A1A" size={24} strokeWidth={2.5} />}
                      rightIcon={
                        showHolidayDropdown ? (
                          <X color="#1A1A1A" size={20} strokeWidth={2.5} />
                        ) : (
                          <ChevronDown color="#1A1A1A" size={20} strokeWidth={2.5} />
                        )
                      }
                      onRightIconPress={() => {
                        if (showHolidayDropdown) {
                          holidayInputRef.current?.blur();
                        } else {
                          holidayInputRef.current?.focus();
                        }
                      }}
                      placeholder={t.selectHoliday}
                      value={holidaySearch}
                      onChangeText={handleHolidaySearchChange}
                      onFocus={() => {
                        if (state.holidayId) {
                          dispatch({ type: 'SET_HOLIDAY', payload: '' });
                          dispatch({ type: 'SET_GREETING', payload: '' });
                          setHolidaySearch('');
                        }
                        setShowHolidayDropdown(true);
                      }}
                      onBlur={() => setShowHolidayDropdown(false)}
                      autoCapitalize="none"
                      autoCorrect={false}
                      error={errors.holidayId}
                    />
                    {showHolidayDropdown && filteredHolidays.length > 0 && (
                      <Animated.View entering={FadeIn} style={styles.dropdownContainer}>
                        <ScrollView
                          style={{ maxHeight: GIFT_CONFIG.CONTACT_DROPDOWN_VISIBLE_ROWS * CONTACT_ITEM_HEIGHT }}
                          keyboardShouldPersistTaps="handled"
                          nestedScrollEnabled
                        >
                          {filteredHolidays.map((h) => (
                            <Pressable
                              key={h.id}
                              style={styles.dropdownItem}
                              onPress={() => handleSelectHoliday(h.id, h.name)}
                            >
                              <Text style={styles.dropdownItemText}>{h.name}</Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                      </Animated.View>
                    )}
                  </View>

                  {/* ── Greeting ── */}
                  <View style={styles.fieldContainer}>
                    <Textarea
                      placeholder={t.greetingPlaceholder}
                      value={state.greeting}
                      onChangeText={(val) => dispatch({ type: 'SET_GREETING', payload: val })}
                      maxLength={250}
                      currentLength={state.greeting.length}
                      style={{ minHeight: 140 }}
                      error={errors.greeting}
                    />
                  </View>

                  {/* ── Unpack Date ── */}
                  <View style={styles.fieldContainer}>
                    <Pressable
                      onPress={() => {
                        if (Platform.OS === 'android') {
                          // Android: no 'datetime' mode — chain date → time imperatively
                          const initial = state.unpackDate ? new Date(state.unpackDate) : new Date();
                          DateTimePickerAndroid.open({
                            value: initial,
                            mode: 'date',
                            is24Hour: true,
                            onChange: (_evt, selectedDate) => {
                              if (!selectedDate) return;
                              // Step 2: pick time
                              DateTimePickerAndroid.open({
                                value: selectedDate,
                                mode: 'time',
                                is24Hour: true,
                                onChange: (_evt2, selectedTime) => {
                                  if (!selectedTime) return;
                                  dispatch({ type: 'SET_UNPACK_DATE', payload: selectedTime.toISOString() });
                                },
                              });
                            },
                          });
                        } else {
                          setShowDatePicker(true);
                        }
                      }}
                    >
                      <View pointerEvents="none">
                        <Input
                          leftIcon={<CalendarDays color="#1A1A1A" size={24} strokeWidth={2.5} />}
                          value={state.unpackDate ? new Date(state.unpackDate).toLocaleString() : ''}
                          placeholder={t.unpackDate}
                          error={errors.unpackDate}
                        />
                      </View>
                    </Pressable>

                    {showDatePicker && Platform.OS === 'ios' && (
                      <Modal transparent animationType="slide">
                        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                          <Pressable style={{ flex: 1 }} onPress={() => setShowDatePicker(false)} />
                          <View style={{ backgroundColor: '#fff', paddingBottom: 40 }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'flex-end',
                                padding: 12,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                borderBottomColor: '#ccc',
                              }}
                            >
                              <Pressable
                                onPress={() => {
                                  if (!state.unpackDate) {
                                    dispatch({ type: 'SET_UNPACK_DATE', payload: new Date().toISOString() });
                                  }
                                  setShowDatePicker(false);
                                }}
                              >
                                <Text style={{ color: '#007AFF', fontSize: 17, fontWeight: '600' }}>Done</Text>
                              </Pressable>
                            </View>
                            {Platform.OS === 'ios' && (
                              <DateTimePicker
                                value={state.unpackDate ? new Date(state.unpackDate) : new Date()}
                                mode="datetime"
                                display="spinner"
                                onChange={(_event, date) => {
                                  if (date) dispatch({ type: 'SET_UNPACK_DATE', payload: date.toISOString() });
                                }}
                              />
                            )}
                          </View>
                        </View>
                      </Modal>
                    )}
                  </View>

                  {/* ── Gift Code ── */}
                  <View style={styles.fieldContainer}>
                    <View style={styles.rowContainer}>
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
                          editable={!hasScannedCode}
                          error={errors.payload}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                      <View>
                        {hasScannedCode ? (
                          <Button layout="circle" variant="red" icon={X} onPress={handleClearScannedCode} />
                        ) : (
                          <Button layout="circle" variant="orange" icon={Camera} onPress={handleScanQr} />
                        )}
                      </View>
                    </View>
                    {hasScannedCode && (
                      <Animated.View entering={FadeInDown.duration(300)} style={styles.qrPreview}>
                        <QrCode color="#7ab648" size={20} strokeWidth={2.5} />
                        <Text style={styles.qrPreviewText} numberOfLines={1}>
                          {state.payloadContent}
                        </Text>
                        <Check color="#7ab648" size={16} strokeWidth={3} />
                      </Animated.View>
                    )}
                  </View>

                  {/* ── Submit Error ── */}
                  {errors.submit && (
                    <Animated.Text entering={FadeIn} style={styles.submitErrorText}>
                      {errors.submit}
                    </Animated.Text>
                  )}

                  {/* ── Footer ── */}
                  <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                    <Button
                      layout="rectangle"
                      variant="transparent"
                      onPress={() => {
                        console.log('[SendForm] CANCEL button pressed');
                        handleClose();
                      }}
                      style={styles.flex1}
                    >
                      {t.cancel}
                    </Button>
                    <Button
                      layout="rectangle"
                      variant="lime"
                      disabled={!isFormValid}
                      status={submitting ? 'loading' : 'idle'}
                      onPress={() => {
                        console.log('[SendForm] SEND button pressed');
                        console.log('[SendForm] Current State:', JSON.stringify(state));
                        console.log('[SendForm] isFormValid=', isFormValid);
                        handleSubmit();
                      }}
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
    backgroundColor: '#FFF5E1',
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
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: '#FFF5E1',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1A1A1A',
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
    color: '#5D4037',
  },
  qrPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(122, 182, 72, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(122, 182, 72, 0.3)',
  },
  qrPreviewText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
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
    marginTop: 'auto',
  },
});
