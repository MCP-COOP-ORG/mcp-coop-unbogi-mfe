import { act, renderHook } from '@testing-library/react-native';
import { useSendGiftForm } from './useSendGiftForm';

const mockContacts = [{ id: '1', displayName: 'John Doe' }];
const mockHolidays = [{ id: 'h1', name: 'Birthday', defaultGreeting: 'Happy Birthday!' }];

jest.mock('@unbogi/shared', () => ({
  GIFT_CONFIG: { CONTACT_SEARCH_MIN_CHARS: 2, CONTACT_SEARCH_MAX_RESULTS: 10 },
  sendFormSchema: {
    safeParse: jest.fn().mockReturnValue({ success: true, data: { payload: {} } }),
  },
  useContactsStore: jest.fn((selector) =>
    selector({
      contacts: mockContacts,
      loadContacts: jest.fn(),
      isLoaded: true,
      isLoading: false,
    }),
  ),
  useHolidaysStore: jest.fn((selector) =>
    selector({
      holidays: mockHolidays,
      loadHolidays: jest.fn(),
      isLoaded: true,
      isLoading: false,
    }),
  ),
  useGiftsStore: jest.fn((selector) =>
    selector({
      sendGift: jest.fn().mockResolvedValue({}),
    }),
  ),
}));

jest.mock('@/store', () => ({
  useModalStore: jest.fn((selector) =>
    selector({
      close: jest.fn(),
    }),
  ),
}));

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('uuid-1234'),
}));

jest.mock('expo-camera', () => ({
  useCameraPermissions: jest.fn().mockReturnValue([{ granted: true }, jest.fn()]),
  CameraView: {
    onModernBarcodeScanned: jest.fn(),
    launchScanner: jest.fn().mockResolvedValue(true),
    dismissScanner: jest.fn(),
  },
}));

describe('useSendGiftForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes correctly', () => {
    const { result } = renderHook(() => useSendGiftForm());

    expect(result.current.state.receiverId).toBe('');
    expect(result.current.state.holidayId).toBe('');
    expect(result.current.state.greeting).toBe('');
    expect(result.current.isFormValid).toBe(false);
  });

  it('sets greeting when holiday is selected', () => {
    const { result } = renderHook(() => useSendGiftForm());

    act(() => {
      result.current.handleSelectHoliday('h1', 'Birthday');
    });

    expect(result.current.state.holidayId).toBe('h1');
    expect(result.current.state.greeting).toBe('Happy Birthday!');
  });

  it('validates form state', () => {
    const { result } = renderHook(() => useSendGiftForm());

    act(() => {
      result.current.handleSelectContact('1', 'John Doe');
      result.current.handleSelectHoliday('h1', 'Birthday');
      result.current.setGreeting('Hello!');
      result.current.handleDateChange(new Date());
      result.current.handlePayloadChange('payload data');
    });

    expect(result.current.isFormValid).toBe(true);
  });
});
