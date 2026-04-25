import { GIFT_CONFIG, sendFormSchema, useContactsStore, useGiftsStore, useHolidaysStore } from '@unbogi/shared';
import { AnimatePresence, motion } from 'framer-motion';
import { Gift, ScanLine, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useT } from '@/hooks/use-t';
import { useTelegramBackButton } from '@/hooks/use-telegram';
import { tg } from '@/lib/telegram';
import { SCREENS, useNavigationStore } from '@/store';
import { Button, Input, Select, type SelectOption, Textarea } from '@/ui';
import { formReducer, initialState } from './send-form-model';

/* ──────────────────────── helpers ──────────────────────── */

/* ──────────────────────── component ──────────────────────── */

/**
 * SendForm — full-screen overlay form for sending a gift.
 * Mounted conditionally by MainScreen; owns its own scroll and back-button logic.
 */
export function SendForm() {
  const setScreen = useNavigationStore((s) => s.setScreen);
  const t = useT().send;

  /* ── data stores ── */
  const { contacts, loadContacts, isLoaded: contactsLoaded, isLoading: contactsLoading } = useContactsStore();
  const { holidays, loadHolidays, isLoaded: holidaysLoaded, isLoading: holidaysLoading } = useHolidaysStore();
  const sendGift = useGiftsStore((s) => s.sendGift);

  /* ── form state ── */
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const isFormValid = Boolean(
    state.receiverId && state.holidayId && state.greeting.trim() && state.unpackDate && state.payloadContent.trim(),
  );

  /* ── bootstrap ── */
  useEffect(() => {
    loadContacts();
    loadHolidays();
  }, [loadContacts, loadHolidays]);

  /* ── back / close ── */
  const goBack = useCallback(() => {
    dispatch({ type: 'RESET' });
    setScreen(SCREENS.MAIN);
  }, [setScreen]);

  useTelegramBackButton(goBack);

  /* ── holiday options ── */
  const holidayOptions: SelectOption[] = useMemo(
    () => holidays.map((h) => ({ value: h.id, label: h.name })),
    [holidays],
  );

  /* ── holiday → prefill greeting ── */
  useEffect(() => {
    if (!state.holidayId) return;
    const selected = holidays.find((h) => h.id === state.holidayId);
    if (!selected?.defaultGreeting) return;
    dispatch({ type: 'SET_FIELD', field: 'greeting', value: selected.defaultGreeting });
  }, [state.holidayId, holidays]);

  /* ── contact search ── */
  const CONTACT_ITEM_HEIGHT = 44;

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_FIELD', field: 'searchQuery', value: e.target.value });
    if (state.receiverId) dispatch({ type: 'SET_FIELD', field: 'receiverId', value: '' });
    setShowDropdown(true);
  };

  const handleSelectContact = (id: string, name: string) => {
    dispatch({ type: 'SET_FIELD', field: 'receiverId', value: id });
    dispatch({ type: 'SET_FIELD', field: 'searchQuery', value: name });
    setShowDropdown(false);
  };

  /* ── QR scan ── */
  const handleScanQr = async () => {
    const result = await tg.scanQr('Point camera at QR code');
    if (result) {
      dispatch({ type: 'SET_FIELD', field: 'payloadType', value: 'qr' });
      dispatch({ type: 'SET_FIELD', field: 'payloadContent', value: result });
    }
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    setErrors({});
    const parsed = sendFormSchema.safeParse({
      receiverId: state.receiverId,
      holidayId: state.holidayId,
      greeting: state.greeting,
      unpackDate: state.unpackDate ? new Date(state.unpackDate) : undefined,
      payload: { type: state.payloadType, content: state.payloadContent },
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
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
        scratchCode: { value: parsed.data.payload.content, format: parsed.data.payload.type },
      });
      dispatch({ type: 'RESET' });
      setScreen(SCREENS.MAIN);
    } catch {
      setErrors({ submit: t.errorSubmit });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── loading ── */
  const isLoading = (!contactsLoaded && contactsLoading) || (!holidaysLoaded && holidaysLoading);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  /* ──────────────────────── render ──────────────────────── */

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col h-full bg-[#FFF5E1]"
    >
      {/* ── Scrollable fields ── */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2" style={{ padding: '20px 20px' }}>
        {/* ── Title ── */}
        <div className="flex items-center justify-center mb-2">
          <h1 className="text-[18px] font-black uppercase tracking-wide text-[#5D4037] drop-shadow-sm">{t.title}</h1>
        </div>

        {/* ── Contact Search ── */}
        <div className="relative">
          <Input
            leftIcon={<Search size={24} strokeWidth={2.5} />}
            placeholder={t.searchFriend}
            value={state.searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            autoComplete="off"
            error={errors.receiverId}
          />
          <AnimatePresence>
            {showDropdown && filteredContacts.length > 0 && !state.receiverId && (
              <motion.ul
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={[
                  'absolute left-0 right-0 top-[calc(100%+4px)] z-50',
                  'rounded-2xl p-[6px] overflow-y-auto',
                  'bg-[#FFF5E1]',
                  'shadow-[0_0_0_1px_#1A1A1A,0_0_0_3px_#FFD1B3,0_0_0_4px_#1A1A1A,0_4px_16px_rgba(0,0,0,0.08)]',
                ].join(' ')}
                style={{ maxHeight: GIFT_CONFIG.CONTACT_DROPDOWN_VISIBLE_ROWS * CONTACT_ITEM_HEIGHT }}
              >
                {filteredContacts.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectContact(c.id, c.displayName)}
                      className={[
                        'w-full text-left px-4 py-[10px] text-[15px] font-medium cursor-pointer',
                        'rounded-xl transition-colors duration-100',
                        'text-[#5D4037] hover:bg-[#FFF5E1] active:bg-[#FFE0B2]',
                      ].join(' ')}
                    >
                      {c.displayName}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* ── Holiday Select ── */}
        <div className="relative">
          <Select
            icon={<Gift size={24} strokeWidth={2.5} />}
            options={holidayOptions}
            value={state.holidayId}
            placeholder={t.selectHoliday}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'holidayId', value: e.target.value })}
            error={errors.holidayId}
          />
        </div>

        {/* ── Greeting ── */}
        <div className="relative">
          <Textarea
            rows={6}
            placeholder={t.greetingPlaceholder}
            value={state.greeting}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'greeting', value: e.target.value })}
            maxLength={GIFT_CONFIG.GREETING_MAX_LENGTH}
            currentLength={state.greeting.length}
            error={errors.greeting}
          />
        </div>

        {/* ── Unpack Date ── */}
        <div className="relative">
          <Input
            type="datetime-local"
            value={state.unpackDate}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'unpackDate', value: e.target.value })}
            placeholder={t.unpackDate}
            error={errors.unpackDate}
          />
        </div>

        {/* ── Gift Code ── */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                leftIcon={<ScanLine size={24} strokeWidth={2.5} />}
                placeholder={t.codePlaceholder}
                value={state.payloadContent}
                onChange={(e) => {
                  dispatch({ type: 'SET_FIELD', field: 'payloadContent', value: e.target.value });
                  if (state.payloadType !== 'text') {
                    dispatch({ type: 'SET_FIELD', field: 'payloadType', value: 'text' });
                  }
                }}
                error={errors.payload}
              />
            </div>
            <div className="w-12 shrink-0 flex justify-center pb-6">
              <Button layout="circle" variant="orange" icon="Camera" onClick={handleScanQr} aria-label="Scan QR" />
            </div>
          </div>
        </div>

        {/* ── Submit Error ── */}
        {errors.submit && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#FF5A5A] font-bold text-[13px] text-center"
          >
            {errors.submit}
          </motion.p>
        )}
      </div>

      {/* ── Pinned bottom buttons ── */}
      <div className="shrink-0 flex gap-2" style={{ padding: '20px 20px 40px' }}>
        <Button layout="pill" variant="transparent" onClick={goBack}>
          {t.cancel}
        </Button>
        <Button
          layout="pill"
          variant={isFormValid ? 'lime' : 'cyan'}
          status={submitting ? 'loading' : 'idle'}
          onClick={handleSubmit}
        >
          {t.send}
        </Button>
      </div>
    </motion.div>
  );
}
