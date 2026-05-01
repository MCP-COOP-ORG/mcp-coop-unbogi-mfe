import {
  type Contact,
  GIFT_CONFIG,
  type Holiday,
  sendFormSchema,
  useContactsStore,
  useGiftsStore,
  useHolidaysStore,
} from '@unbogi/shared';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Crypto from 'expo-crypto';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import { logger } from '@/shared/lib';
import { useModalStore } from '@/store';
import { formReducer, initialState, type SendFormErrorKey, type SendFormState } from '../model';

export interface UseSendGiftFormResult {
  /* data */
  state: SendFormState;
  errors: Partial<Record<SendFormErrorKey, string>>;
  submitting: boolean;
  isLoading: boolean;
  isFormValid: boolean;
  /* contact dropdown */
  filteredContacts: Contact[];
  showDropdown: boolean;
  contactInputRef: React.RefObject<TextInput | null>;
  handleSearchChange: (val: string) => void;
  handleSelectContact: (id: string, name: string) => void;
  /* holiday dropdown */
  filteredHolidays: Holiday[];
  showHolidayDropdown: boolean;
  holidaySearch: string;
  holidayInputRef: React.RefObject<TextInput | null>;
  handleHolidaySearchChange: (val: string) => void;
  handleSelectHoliday: (id: string, name: string) => void;
  /* date */
  showDatePicker: boolean;
  setShowDatePicker: (v: boolean) => void;
  handleDateChange: (date: Date) => void;
  /* qr / code */
  hasScannedCode: boolean;
  cameraPermission: ReturnType<typeof useCameraPermissions>[0];
  handleScanQr: () => Promise<void>;
  handleClearScannedCode: () => void;
  handlePayloadChange: (val: string) => void;
  /* form actions */
  handleClose: () => void;
  handleSubmit: () => Promise<void>;
  /* dispatch for greeting textarea */
  setGreeting: (val: string) => void;
}

export function useSendGiftForm(): UseSendGiftFormResult {
  const close = useModalStore((s) => s.close);

  const contacts = useContactsStore((s) => s.contacts);
  const loadContacts = useContactsStore((s) => s.loadContacts);
  const contactsLoaded = useContactsStore((s) => s.isLoaded);
  const contactsLoading = useContactsStore((s) => s.isLoading);

  const holidays = useHolidaysStore((s) => s.holidays);
  const loadHolidays = useHolidaysStore((s) => s.loadHolidays);
  const holidaysLoaded = useHolidaysStore((s) => s.isLoaded);
  const holidaysLoading = useHolidaysStore((s) => s.isLoading);

  const sendGift = useGiftsStore((s) => s.sendGift);

  const [state, dispatch] = useReducer(formReducer, initialState);
  const [errors, setErrors] = useState<Partial<Record<SendFormErrorKey, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showHolidayDropdown, setShowHolidayDropdown] = useState(false);
  const [holidaySearch, setHolidaySearch] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const contactInputRef = useRef<TextInput | null>(null);
  const holidayInputRef = useRef<TextInput | null>(null);
  const scanSubscriptionRef = useRef<ReturnType<typeof CameraView.onModernBarcodeScanned> | null>(null);

  const hasScannedCode = state.payloadFormat === 'qr-code' && state.payloadContent.length > 0;

  const isFormValid = Boolean(
    state.receiverId && state.holidayId && state.greeting.trim() && state.unpackDate && state.payloadContent.trim(),
  );

  const isLoading = (!contactsLoaded && contactsLoading) || (!holidaysLoaded && holidaysLoading);

  /* ── bootstrap ── */
  useEffect(() => {
    loadContacts();
    loadHolidays();
  }, [loadContacts, loadHolidays]);

  /* ── cleanup scan subscription on unmount ── */
  useEffect(() => {
    return () => {
      scanSubscriptionRef.current?.remove();
    };
  }, []);

  /* ── holiday → prefill greeting ── */
  useEffect(() => {
    if (!state.holidayId) return;
    const selected = holidays.find((h) => h.id === state.holidayId);
    if (!selected?.defaultGreeting) return;
    dispatch({ type: 'SET_GREETING', payload: selected.defaultGreeting });
  }, [state.holidayId, holidays]);

  /* ── close / reset ── */
  const handleClose = useCallback(() => {
    dispatch({ type: 'RESET' });
    setErrors({});
    setShowDropdown(false);
    setShowHolidayDropdown(false);
    setHolidaySearch('');
    close();
  }, [close]);

  /* ── contact filtering ── */
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

  /* ── holiday filtering ── */
  const filteredHolidays = useMemo(() => {
    const query = holidaySearch.trim().toLowerCase();
    return query.length > 0 ? holidays.filter((h) => h.name.toLowerCase().includes(query)) : holidays;
  }, [holidays, holidaySearch]);

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

  /* ── date ── */
  const handleDateChange = (date: Date) => {
    dispatch({ type: 'SET_UNPACK_DATE', payload: date.toISOString() });
  };

  /* ── QR scan ── */
  const handleScanQr = async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) return;
    }

    scanSubscriptionRef.current?.remove();
    scanSubscriptionRef.current = null;

    scanSubscriptionRef.current = CameraView.onModernBarcodeScanned(({ data }) => {
      if (!data || data.trim().length === 0) return;
      scanSubscriptionRef.current?.remove();
      scanSubscriptionRef.current = null;
      dispatch({ type: 'SET_PAYLOAD_FORMAT', payload: 'qr-code' });
      dispatch({ type: 'SET_PAYLOAD_CONTENT', payload: data });
      CameraView.dismissScanner();
    });

    CameraView.launchScanner({ barcodeTypes: ['qr'] }).catch((err: unknown) => logger.error(err));
  };

  const handleClearScannedCode = () => {
    dispatch({ type: 'SET_PAYLOAD_FORMAT', payload: 'code' });
    dispatch({ type: 'SET_PAYLOAD_CONTENT', payload: '' });
  };

  const handlePayloadChange = (val: string) => {
    if (state.payloadFormat !== 'code') {
      dispatch({ type: 'SET_PAYLOAD_FORMAT', payload: 'code' });
    }
    dispatch({ type: 'SET_PAYLOAD_CONTENT', payload: val });
  };

  const setGreeting = (val: string) => dispatch({ type: 'SET_GREETING', payload: val });

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

    const payload = {
      idempotencyKey: Crypto.randomUUID(),
      receiverId: parsed.data.receiverId,
      holidayId: parsed.data.holidayId,
      greeting: parsed.data.greeting,
      unpackDate: state.unpackDate ? new Date(state.unpackDate).toISOString() : '',
      scratchCode: { value: parsed.data.payload.content, format: parsed.data.payload.format },
    };

    try {
      await sendGift(payload);
      handleClose();
    } catch (err: unknown) {
      logger.error(err);
      setErrors({ submit: 'Failed to send gift. Try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    state,
    errors,
    submitting,
    isLoading,
    isFormValid,
    filteredContacts,
    showDropdown,
    contactInputRef,
    handleSearchChange,
    handleSelectContact,
    filteredHolidays,
    showHolidayDropdown,
    holidaySearch,
    holidayInputRef,
    handleHolidaySearchChange,
    handleSelectHoliday,
    showDatePicker,
    setShowDatePicker,
    handleDateChange,
    hasScannedCode,
    cameraPermission,
    handleScanQr,
    handleClearScannedCode,
    handlePayloadChange,
    handleClose,
    handleSubmit,
    setGreeting,
  };
}
