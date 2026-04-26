import { isValidEmail } from '@unbogi/contracts';
import { invitesApi } from '@unbogi/shared';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Mail } from 'lucide-react';
import { useState } from 'react';
import { useT } from '@/hooks/use-t';
import { ASSETS } from '@/lib/assets';
import { useInviteModalStore } from '@/store';
import { Button, Input } from '@/ui';

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

export function InviteModal() {
  const t = useT().invite;
  const { isInviteModalOpen, closeInviteModal } = useInviteModalStore();
  const [email, setEmail] = useState('');
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isTouched, setIsTouched] = useState(false);

  const isEmailValid = isValidEmail(email);
  const showEmailError = isTouched && !isEmailValid;
  const currentError =
    submitStatus === 'error'
      ? errorMessage
      : showEmailError
        ? email.length === 0
          ? t.emailRequired
          : t.emailInvalid
        : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTouched(true);
    if (!email || !isEmailValid) return;

    setSubmitStatus('loading');
    try {
      await invitesApi.sendEmailInvite(email);
      setSubmitStatus('success');
      setTimeout(() => {
        closeInviteModal();
        setSubmitStatus('idle');
        setEmail('');
      }, 2000);
    } catch (err: unknown) {
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : t.errorGeneric);
    }
  };

  const handleClose = () => {
    closeInviteModal();
    setSubmitStatus('idle');
    setEmail('');
    setErrorMessage('');
    setIsTouched(false);
  };

  const isLoading = submitStatus === 'loading';

  return (
    <AnimatePresence>
      {isInviteModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }}
            className={[
              'fixed top-1/2 left-1/2 z-50 flex flex-col',
              'w-[calc(100%-40px)]',
              'rounded-[32px] overflow-hidden',
              'bg-[#FFF5E1]',
              'shadow-[0_0_0_2px_#1A1A1A,0_0_0_5px_#FFD1B3,0_0_0_7px_#1A1A1A,0_8px_32px_rgba(0,0,0,0.18)]',
            ].join(' ')}
          >
            <div className="flex-1 flex flex-col items-center gap-2" style={{ padding: '20px 20px 0' }}>
              <img src={ASSETS.BIRD} alt="Invite Bird" className="w-20 h-20 object-contain" />

              <h1 className="text-[20px] font-bold text-[#4A3A35]">{t.title}</h1>

              <p className="text-[14px] text-[#4A3A35]/70 text-center px-4">{t.subtitle}</p>

              {submitStatus === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-4"
                >
                  <CheckCircle className="w-10 h-10 text-[#10b981] mb-2" strokeWidth={1.5} />
                  <p className="text-[#4A3A35] font-medium">{t.success}</p>
                </motion.div>
              ) : (
                <form id="invite-form" onSubmit={handleSubmit} className="flex flex-col gap-4 w-full mt-1">
                  <Input
                    type="email"
                    leftIcon={<Mail size={24} strokeWidth={2.5} />}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (submitStatus === 'error') setSubmitStatus('idle');
                    }}
                    onBlur={() => setIsTouched(true)}
                    placeholder={t.emailPlaceholder}
                    disabled={isLoading}
                    variant={currentError ? 'error' : 'normal'}
                    error={currentError}
                  />
                </form>
              )}
            </div>

            {/* Pinned bottom buttons */}
            <div className="shrink-0 flex gap-3" style={{ padding: '16px 20px 20px' }}>
              {submitStatus === 'success' ? (
                <Button layout="pill" variant="cyan" onClick={handleClose}>
                  {t.close}
                </Button>
              ) : (
                <>
                  <Button
                    layout="pill"
                    variant="transparent"
                    status={isLoading ? 'disabled' : 'idle'}
                    onClick={handleClose}
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    form="invite-form"
                    type="submit"
                    layout="pill"
                    variant={isEmailValid ? 'lime' : 'cyan'}
                    status={isLoading ? 'loading' : 'idle'}
                  >
                    {t.send}
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
