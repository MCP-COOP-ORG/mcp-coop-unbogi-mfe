import { invitesApi, isValidEmail } from '@unbogi/shared';
import { useState } from 'react';
import { useModalStore } from '@/store';

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseInviteFormResult {
  email: string;
  submitStatus: SubmitStatus;
  errorMessage: string;
  isTouched: boolean;
  isEmailValid: boolean;
  isLoading: boolean;
  setEmail: (val: string) => void;
  handleSubmit: () => Promise<void>;
  handleClose: () => void;
  setSubmitStatusIdle: () => void;
  markTouched: () => void;
}

export function useInviteForm(): UseInviteFormResult {
  const close = useModalStore((s) => s.close);
  const [email, setEmail] = useState('');
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isTouched, setIsTouched] = useState(false);

  const isEmailValid = isValidEmail(email);
  const isLoading = submitStatus === 'loading';

  const handleSubmit = async () => {
    setIsTouched(true);
    if (!email || !isEmailValid) return;

    setSubmitStatus('loading');
    try {
      await invitesApi.sendEmailInvite(email);
      setSubmitStatus('success');
      setTimeout(() => {
        close();
        setTimeout(() => {
          setSubmitStatus('idle');
          setEmail('');
        }, 300);
      }, 2000);
    } catch (err: unknown) {
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send invite');
    }
  };

  const handleClose = () => {
    close();
    setTimeout(() => {
      setSubmitStatus('idle');
      setEmail('');
      setErrorMessage('');
      setIsTouched(false);
    }, 300);
  };

  const setSubmitStatusIdle = () => setSubmitStatus('idle');
  const markTouched = () => setIsTouched(true);

  return {
    email,
    submitStatus,
    errorMessage,
    isTouched,
    isEmailValid,
    isLoading,
    setEmail,
    handleSubmit,
    handleClose,
    setSubmitStatusIdle,
    markTouched,
  };
}
