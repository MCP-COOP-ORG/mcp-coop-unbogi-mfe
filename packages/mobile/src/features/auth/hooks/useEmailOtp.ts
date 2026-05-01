import { authApi } from '@unbogi/shared';
import { useState } from 'react';
import { Alert } from 'react-native';

type OtpStep = 'email' | 'code';

interface UseEmailOtpResult {
  email: string;
  code: string;
  step: OtpStep;
  loading: boolean;
  setEmail: (val: string) => void;
  setCode: (val: string) => void;
  handleSendEmail: () => Promise<void>;
  handleVerify: () => Promise<void>;
  goBack: () => void;
}

export function useEmailOtp(): UseEmailOtpResult {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<OtpStep>('email');
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async () => {
    if (!email?.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }
    setLoading(true);
    try {
      await authApi.sendEmailOtp(email);
      setStep('code');
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code || code.length < 6) {
      Alert.alert('Error', 'Please enter a valid code');
      return;
    }
    setLoading(true);
    try {
      await authApi.verifyEmailOtp(email, code);
      // useAuthStore's onAuthStateChanged will pick up the login and redirect automatically
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => setStep('email');

  return { email, code, step, loading, setEmail, setCode, handleSendEmail, handleVerify, goBack };
}
