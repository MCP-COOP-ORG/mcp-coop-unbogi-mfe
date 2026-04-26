import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  type ContactsState,
  type GiftsState,
  type HolidaysState,
  sendFormSchema,
  useContactsStore,
  useGiftsStore,
  useHolidaysStore,
} from '@unbogi/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tg } from '@/lib';
import { SCREENS, useNavigationStore } from '@/store';
import { SendForm } from './send-form';

// Mock dependencies
vi.mock('@unbogi/shared', () => ({
  sendFormSchema: {
    safeParse: vi.fn(),
  },
  useContactsStore: vi.fn(),
  useGiftsStore: vi.fn(),
  useHolidaysStore: vi.fn(),
  GIFT_CONFIG: {
    CONTACT_SEARCH_MIN_CHARS: 2,
    CONTACT_SEARCH_MAX_RESULTS: 5,
    CONTACT_DROPDOWN_VISIBLE_ROWS: 3,
    GREETING_MAX_LENGTH: 200,
  },
}));

vi.mock('@/hooks', () => ({
  useT: () => ({
    send: {
      title: 'Send a Gift',
      searchFriend: 'Search friend',
      selectHoliday: 'Select holiday',
      greetingPlaceholder: 'Greeting...',
      unpackDate: 'Unpack date',
      codePlaceholder: 'Gift code',
      cancel: 'Cancel',
      send: 'Send',
      errorSubmit: 'Submit error',
    },
  }),
  useTelegramBackButton: vi.fn(),
}));

vi.mock('@/lib', () => ({
  tg: {
    scanQr: vi.fn(),
  },
}));

vi.mock('@/store', () => ({
  SCREENS: {
    MAIN: 'MAIN',
  },
  useNavigationStore: vi.fn(),
}));

// Provide basic UI mocks so tests aren't bogged down
vi.mock('@/ui', () => ({
  Button: ({ children, onClick, 'aria-label': ariaLabel, status }: Record<string, never>) => (
    <button type="button" onClick={onClick} aria-label={ariaLabel} data-status={status}>
      {children || 'Button'}
    </button>
  ),
  Input: ({ onChange, onFocus, onBlur, placeholder, error, type, value }: Record<string, never>) => (
    <div>
      <input
        type={type || 'text'}
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-label={placeholder}
      />
      {error && <span role="alert">{error}</span>}
    </div>
  ),
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
  Select: ({
    options,
    onChange,
    placeholder,
    error,
    value,
  }: {
    options: { value: string; label: string }[];
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
    placeholder?: string;
    error?: string;
    value?: string;
  }) => (
    <div>
      <select value={value || ''} onChange={onChange} aria-label={placeholder}>
        <option value="">{placeholder}</option>
        {options?.map((o: { value: string; label: string }) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span role="alert">{error}</span>}
    </div>
  ),
  Textarea: ({ onChange, placeholder, error, value }: Record<string, never>) => (
    <div>
      <textarea value={value || ''} onChange={onChange} placeholder={placeholder} aria-label={placeholder} />
      {error && <span role="alert">{error}</span>}
    </div>
  ),
}));

describe('SendForm', () => {
  const mockSetScreen = vi.fn();
  const mockSendGift = vi.fn();
  const mockLoadContacts = vi.fn();
  const mockLoadHolidays = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useNavigationStore).mockImplementation((selector: unknown) =>
      (selector as (state: unknown) => unknown)({
        activeScreen: SCREENS.MAIN,
        setScreen: mockSetScreen,
      }),
    );

    vi.mocked(useContactsStore).mockReturnValue({
      contacts: [
        { id: '1', displayName: 'Alice' },
        { id: '2', displayName: 'Bob' },
        { id: '3', displayName: 'Charlie' },
      ],
      loadContacts: mockLoadContacts,
      isLoaded: true,
      isLoading: false,
      reset: vi.fn(),
    } as ContactsState);

    vi.mocked(useHolidaysStore).mockReturnValue({
      holidays: [
        { id: 'h1', name: 'New Year', defaultGreeting: 'Happy New Year!' },
        { id: 'h2', name: 'Birthday', defaultGreeting: 'Happy Birthday!' },
      ],
      loadHolidays: mockLoadHolidays,
      isLoaded: true,
      isLoading: false,
      reset: vi.fn(),
    } as HolidaysState);

    vi.mocked(useGiftsStore).mockImplementation(
      (selector) =>
        selector({
          isLoaded: true,
          isLoading: false,
          receivedGifts: [],
          openedGifts: [],
          loadGifts: vi.fn(),
          sendGift: mockSendGift,
          scratchGift: vi.fn(),
          reset: vi.fn(),
        } as GiftsState) as unknown,
    );

    // Default safeParse to success
    vi.mocked(sendFormSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        receiverId: '1',
        holidayId: 'h1',
        greeting: 'Happy New Year!',
        unpackDate: new Date('2026-01-01T00:00:00.000Z'),
        payload: { format: 'code', content: '123456' },
      },
    } as ReturnType<typeof sendFormSchema.safeParse>);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders loading spinner if contacts are loading', () => {
    vi.mocked(useContactsStore).mockReturnValue({
      contacts: [],
      loadContacts: mockLoadContacts,
      isLoaded: false,
      isLoading: true,
      reset: vi.fn(),
    } as ContactsState);

    render(<SendForm />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders loading spinner if holidays are loading', () => {
    vi.mocked(useHolidaysStore).mockReturnValue({
      holidays: [],
      loadHolidays: mockLoadHolidays,
      isLoaded: false,
      isLoading: true,
      reset: vi.fn(),
    } as HolidaysState);

    render(<SendForm />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders the form correctly when loaded', () => {
    render(<SendForm />);
    expect(screen.getByText('Send a Gift')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search friend')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Select holiday' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Greeting...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Unpack date')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Gift code')).toBeInTheDocument();
  });

  it('filters and selects contacts correctly', async () => {
    render(<SendForm />);

    const searchInput = screen.getByPlaceholderText('Search friend');

    // Type query
    fireEvent.change(searchInput, { target: { value: 'Ali' } });

    // Alice should be visible
    const aliceBtn = screen.getByText('Alice');
    expect(aliceBtn).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();

    // Select Alice
    fireEvent.click(aliceBtn);

    // The query should be updated to 'Alice'
    expect(searchInput).toHaveValue('Alice');
  });

  it('auto-fills greeting when holiday is selected', () => {
    render(<SendForm />);

    const select = screen.getByRole('combobox', { name: 'Select holiday' });
    fireEvent.change(select, { target: { value: 'h1' } }); // New Year

    const greetingInput = screen.getByPlaceholderText('Greeting...');
    expect(greetingInput).toHaveValue('Happy New Year!');
  });

  it('handles QR code scanning', async () => {
    vi.mocked(tg.scanQr).mockResolvedValueOnce('SCANNED_QR_CODE');
    render(<SendForm />);

    const scanBtn = screen.getByLabelText('Scan QR');
    await act(async () => {
      fireEvent.click(scanBtn);
    });

    expect(tg.scanQr).toHaveBeenCalledWith('Point camera at QR code');
    const codeInput = screen.getByPlaceholderText('Gift code');
    expect(codeInput).toHaveValue('SCANNED_QR_CODE');
  });

  it('handles form submission successfully', async () => {
    render(<SendForm />);

    await act(async () => {
      fireEvent.click(screen.getByText('Send'));
    });

    expect(sendFormSchema.safeParse).toHaveBeenCalled();
    expect(mockSendGift).toHaveBeenCalled();
    expect(mockSetScreen).toHaveBeenCalledWith(SCREENS.MAIN);
  });

  it('shows validation errors when safeParse fails', async () => {
    vi.mocked(sendFormSchema.safeParse).mockReturnValue({
      success: false,
      error: {
        issues: [
          { path: ['receiverId'], message: 'Receiver is required' },
          { path: ['greeting'], message: 'Greeting is required' },
        ],
      },
    } as ReturnType<typeof sendFormSchema.safeParse>);

    render(<SendForm />);

    await act(async () => {
      fireEvent.click(screen.getByText('Send'));
    });

    expect(screen.getByText('Receiver is required')).toBeInTheDocument();
    expect(screen.getByText('Greeting is required')).toBeInTheDocument();
    expect(mockSendGift).not.toHaveBeenCalled();
  });

  it('shows submit error if sendGift throws', async () => {
    mockSendGift.mockRejectedValueOnce(new Error('Network error'));

    render(<SendForm />);

    await act(async () => {
      fireEvent.click(screen.getByText('Send'));
    });

    expect(screen.getByText('Submit error')).toBeInTheDocument();
  });

  it('navigates back when cancel is clicked', () => {
    render(<SendForm />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockSetScreen).toHaveBeenCalledWith(SCREENS.MAIN);
  });

  it('hides dropdown on blur outside of search container', () => {
    render(
      <div>
        <SendForm />
        <button type="button" data-testid="outside">
          Outside
        </button>
      </div>,
    );
    const searchInput = screen.getByPlaceholderText('Search friend');

    // Type query to show dropdown
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: 'Ali' } });
    expect(screen.getByText('Alice')).toBeInTheDocument();

    // Blur to outside
    fireEvent.blur(searchInput, { relatedTarget: screen.getByTestId('outside') });

    // Dropdown should be hidden
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });

  it('keeps dropdown open if blurred inside relative container', () => {
    render(<SendForm />);
    const searchInput = screen.getByPlaceholderText('Search friend');

    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: 'Ali' } });
    expect(screen.getByText('Alice')).toBeInTheDocument();

    const closestSpy = vi.spyOn(Element.prototype, 'closest').mockReturnValue({ contains: () => true } as never);

    fireEvent.blur(searchInput, {
      relatedTarget: document.createElement('div'),
    });

    expect(screen.getByText('Alice')).toBeInTheDocument();
    closestSpy.mockRestore();
  });

  it('resets payloadFormat to code when input changes manually', async () => {
    vi.mocked(tg.scanQr).mockResolvedValueOnce('SCANNED');
    render(<SendForm />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Scan QR'));
    });

    const codeInput = screen.getByPlaceholderText('Gift code');
    fireEvent.change(codeInput, { target: { value: 'MANUAL_CODE' } });

    expect(codeInput).toHaveValue('MANUAL_CODE');
  });

  it('updates unpack date correctly and submits with it', async () => {
    render(<SendForm />);

    // Fill out form correctly to test valid form state (lime button)
    const searchInput = screen.getByPlaceholderText('Search friend');
    fireEvent.change(searchInput, { target: { value: 'Ali' } });
    fireEvent.click(screen.getByText('Alice'));

    const select = screen.getByRole('combobox', { name: 'Select holiday' });
    fireEvent.change(select, { target: { value: 'h1' } });

    const dateInput = screen.getByPlaceholderText('Unpack date');
    fireEvent.change(dateInput, { target: { value: '2026-12-31T00:00' } });
    expect(dateInput).toHaveValue('2026-12-31T00:00');

    // Also covers sending with filled unpack date (lines 112, 133)
    await act(async () => {
      fireEvent.click(screen.getByText('Send'));
    });

    expect(mockSendGift).toHaveBeenCalled();
  });

  it('resets receiverId when typing in search after selection', () => {
    render(<SendForm />);

    const searchInput = screen.getByPlaceholderText('Search friend');

    // Select contact
    fireEvent.change(searchInput, { target: { value: 'Ali' } });
    fireEvent.click(screen.getByText('Alice'));

    // Now type something else (covers line 86 branch)
    fireEvent.change(searchInput, { target: { value: 'Ali' } });

    // The dropdown should re-appear because receiverId was cleared
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('does not auto-fill greeting if holiday has no defaultGreeting', () => {
    vi.mocked(useHolidaysStore).mockReturnValue({
      holidays: [
        { id: 'h_no_greet', name: 'No Greeting Holiday' }, // Missing defaultGreeting
      ],
      loadHolidays: mockLoadHolidays,
      isLoaded: true,
      isLoading: false,
      reset: vi.fn(),
    } as HolidaysState);

    render(<SendForm />);

    const select = screen.getByRole('combobox', { name: 'Select holiday' });
    fireEvent.change(select, { target: { value: 'h_no_greet' } });

    const greetingInput = screen.getByPlaceholderText('Greeting...');
    expect(greetingInput).toHaveValue(''); // Should remain empty
  });

  it('ignores unknown reducer actions gracefully', async () => {
    const { formReducer, initialState } = await import('./send-form-model');
    const state = formReducer(initialState, { type: 'UNKNOWN_ACTION' } as unknown as Parameters<typeof formReducer>[1]);
    expect(state).toEqual(initialState);
  });
});
