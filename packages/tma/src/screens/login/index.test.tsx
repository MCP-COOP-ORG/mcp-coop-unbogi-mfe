import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AUTH_STATUS, useAuthStore } from '@unbogi/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginScreen } from './index';

// Mock dependencies
vi.mock('@/hooks', () => ({
  useT: () => ({
    auth: {
      emailPlaceholder: 'Email placeholder',
      codePlaceholder: 'Code placeholder',
      codeSent: 'Code sent to',
    },
  }),
}));

vi.mock('./components', () => ({
  OtpTimer: ({ onExpired }: { onExpired: () => void }) => (
    <button type="button" data-testid="otp-timer" onClick={onExpired}>
      Timer
    </button>
  ),
  useAuthForm: vi.fn(),
}));

import { useAuthForm } from './components';

describe('LoginScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ status: AUTH_STATUS.UNAUTHENTICATED });
    vi.mocked(useAuthForm).mockReturnValue({
      step: 'email',
      email: '',
      code: '',
      isEmailValid: false,
      isCodeValid: false,
      isLoading: false,
      otpExpired: false,
      errorToShow: null,
      isEmailDirty: false,
      isCodeDirty: false,
      isEmailTouched: false,
      isCodeTouched: false,
      apiError: null,
      otpSentAt: null,
      handleEmailChange: vi.fn(),
      handleEmailBlur: vi.fn(),
      handleCodeChange: vi.fn(),
      handleCodeBlur: vi.fn(),
      handleSendEmail: vi.fn(),
      handleSubmitCode: vi.fn(),
      handleBack: vi.fn(),
      handleTimerExpired: vi.fn(),
    });
  });

  it('renders loading state when global status is idle', () => {
    useAuthStore.setState({ status: AUTH_STATUS.IDLE });
    render(<LoginScreen />);

    // Lucide Loader2 is an SVG. We can check if email input is absent
    expect(screen.queryByPlaceholderText('Email placeholder')).not.toBeInTheDocument();

    // We can just verify it doesn't crash
  });

  it('renders loading state when global status is loading', () => {
    useAuthStore.setState({ status: AUTH_STATUS.LOADING });
    render(<LoginScreen />);
    expect(screen.queryByPlaceholderText('Email placeholder')).not.toBeInTheDocument();
  });

  it('renders email step correctly', () => {
    useAuthStore.setState({ status: AUTH_STATUS.UNAUTHENTICATED });
    render(<LoginScreen />);

    expect(screen.getByPlaceholderText('Email placeholder')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Code placeholder')).not.toBeInTheDocument();
  });

  it('calls handleEmailChange on input', async () => {
    const handleEmailChange = vi.fn();
    vi.mocked(useAuthForm).mockReturnValue({
      step: 'email',
      email: '',
      code: '',
      isEmailValid: false,
      isCodeValid: false,
      isLoading: false,
      otpExpired: false,
      errorToShow: null,
      isEmailDirty: false,
      isCodeDirty: false,
      isEmailTouched: false,
      isCodeTouched: false,
      apiError: null,
      otpSentAt: null,
      handleEmailChange,
      handleEmailBlur: vi.fn(),
      handleCodeChange: vi.fn(),
      handleCodeBlur: vi.fn(),
      handleSendEmail: vi.fn(),
      handleSubmitCode: vi.fn(),
      handleBack: vi.fn(),
      handleTimerExpired: vi.fn(),
    });

    render(<LoginScreen />);

    const input = screen.getByPlaceholderText('Email placeholder');
    await userEvent.type(input, 'a');

    expect(handleEmailChange).toHaveBeenCalledWith('a');
  });

  it('renders code step correctly', () => {
    vi.mocked(useAuthForm).mockReturnValue({
      step: 'code',
      email: 'test@example.com',
      code: '',
      isEmailValid: true,
      isCodeValid: false,
      isLoading: false,
      otpExpired: false,
      errorToShow: null,
      isEmailDirty: false,
      isCodeDirty: false,
      isEmailTouched: false,
      isCodeTouched: false,
      apiError: null,
      otpSentAt: Date.now(),
      handleEmailChange: vi.fn(),
      handleEmailBlur: vi.fn(),
      handleCodeChange: vi.fn(),
      handleCodeBlur: vi.fn(),
      handleSendEmail: vi.fn(),
      handleSubmitCode: vi.fn(),
      handleBack: vi.fn(),
      handleTimerExpired: vi.fn(),
    });

    render(<LoginScreen />);

    expect(screen.getByPlaceholderText('Code placeholder')).toBeInTheDocument();
    expect(screen.getByText(/Code sent to/)).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByTestId('otp-timer')).toBeInTheDocument();
  });

  it('renders code step without timer if otpSentAt is null', () => {
    vi.mocked(useAuthForm).mockReturnValue({
      step: 'code',
      email: 'test@example.com',
      code: '',
      isEmailValid: true,
      isCodeValid: false,
      isLoading: false,
      otpExpired: false,
      errorToShow: null,
      isEmailDirty: false,
      isCodeDirty: false,
      isEmailTouched: false,
      isCodeTouched: false,
      apiError: null,
      otpSentAt: null,
      handleEmailChange: vi.fn(),
      handleEmailBlur: vi.fn(),
      handleCodeChange: vi.fn(),
      handleCodeBlur: vi.fn(),
      handleSendEmail: vi.fn(),
      handleSubmitCode: vi.fn(),
      handleBack: vi.fn(),
      handleTimerExpired: vi.fn(),
    });

    render(<LoginScreen />);

    expect(screen.getByPlaceholderText('Code placeholder')).toBeInTheDocument();
    expect(screen.queryByTestId('otp-timer')).not.toBeInTheDocument();
  });

  it('calls handleSendEmail on Enter key in email input', async () => {
    const handleSendEmail = vi.fn();
    vi.mocked(useAuthForm).mockReturnValue({
      step: 'email',
      email: 'test@example.com',
      code: '',
      isEmailValid: true,
      isCodeValid: false,
      isLoading: false,
      otpExpired: false,
      errorToShow: null,
      isEmailDirty: false,
      isCodeDirty: false,
      isEmailTouched: false,
      isCodeTouched: false,
      apiError: null,
      otpSentAt: null,
      handleEmailChange: vi.fn(),
      handleEmailBlur: vi.fn(),
      handleCodeChange: vi.fn(),
      handleCodeBlur: vi.fn(),
      handleSendEmail,
      handleSubmitCode: vi.fn(),
      handleBack: vi.fn(),
      handleTimerExpired: vi.fn(),
    });

    render(<LoginScreen />);
    const input = screen.getByPlaceholderText('Email placeholder');

    await userEvent.type(input, '{enter}');
    expect(handleSendEmail).toHaveBeenCalled();
  });

  it('calls handleSubmitCode on Enter key in code input', async () => {
    const handleSubmitCode = vi.fn();
    vi.mocked(useAuthForm).mockReturnValue({
      step: 'code',
      email: 'test@example.com',
      code: '123456',
      isEmailValid: true,
      isCodeValid: true,
      isLoading: false,
      otpExpired: false,
      errorToShow: null,
      isEmailDirty: false,
      isCodeDirty: false,
      isEmailTouched: false,
      isCodeTouched: false,
      apiError: null,
      otpSentAt: Date.now(),
      handleEmailChange: vi.fn(),
      handleEmailBlur: vi.fn(),
      handleCodeChange: vi.fn(),
      handleCodeBlur: vi.fn(),
      handleSendEmail: vi.fn(),
      handleSubmitCode,
      handleBack: vi.fn(),
      handleTimerExpired: vi.fn(),
    });

    render(<LoginScreen />);
    const input = screen.getByPlaceholderText('Code placeholder');

    await userEvent.type(input, '{enter}');
    expect(handleSubmitCode).toHaveBeenCalled();
  });
});
