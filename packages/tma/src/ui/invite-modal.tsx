import { invitesApi } from '@unbogi/shared';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Loader2, Mail } from 'lucide-react';
import { useState } from 'react';
import { useInviteModalStore } from '@/store';
import { Button, Input } from '@/ui';

export function InviteModal() {
  const { isInviteModalOpen, closeInviteModal } = useInviteModalStore();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isTouched, setIsTouched] = useState(false);

  const isEmailValid = /^\S+@\S+\.\S+$/.test(email);
  const showEmailError = isTouched && !isEmailValid;
  const currentError =
    status === 'error'
      ? errorMessage
      : showEmailError
        ? email.length === 0
          ? 'Email is required'
          : 'Please enter a valid email address'
        : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTouched(true);
    if (!email || !isEmailValid) {
      return;
    }

    setStatus('loading');
    try {
      await invitesApi.sendEmailInvite(email);
      setStatus('success');
      setTimeout(() => {
        closeInviteModal();
        setStatus('idle');
        setEmail('');
      }, 2000);
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send invite');
    }
  };

  const handleClose = () => {
    closeInviteModal();
    setStatus('idle');
    setEmail('');
    setErrorMessage('');
    setIsTouched(false);
  };

  return (
    <AnimatePresence>
      {isInviteModalOpen && (
        <>
          {/* Backdrop: removed the heavy black, using strong blur */}
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
              'w-[calc(100%-40px)]', // 20px indent from edges
              'rounded-[32px] overflow-hidden',
              'bg-[#FFF5E1]',
              'border-2 border-[#FFD1B3]',
              'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
            ].join(' ')}
          >
            <div className="flex-1 flex flex-col items-center gap-4" style={{ padding: '32px 20px 0' }}>
              <img src={`${import.meta.env.BASE_URL}bird.png`} alt="Invite Bird" className="w-24 h-24 object-contain" />

              {/* ── Title ── */}
              <h1 className="text-[22px] font-bold text-[#4A3A35]">Invite a Friend</h1>

              {/* ── Content ── */}
              <p className="text-[15px] text-[#4A3A35]/70 text-center px-4">
                Send an exclusive invitation link directly to their email.
              </p>

              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-6"
                >
                  <CheckCircle className="w-12 h-12 text-[#10b981] mb-2" strokeWidth={1.5} />
                  <p className="text-[#4A3A35] font-medium">Invite Sent!</p>
                </motion.div>
              ) : (
                <form id="invite-form" onSubmit={handleSubmit} className="flex flex-col gap-6 w-full mt-2">
                  <div className="relative">
                    <Input
                      type="email"
                      leftIcon={<Mail size={15} strokeWidth={2} />}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === 'error') setStatus('idle');
                      }}
                      onBlur={() => setIsTouched(true)}
                      placeholder="friend@example.com"
                      disabled={status === 'loading'}
                      variant={currentError ? 'error' : 'normal'}
                      error={currentError}
                    />
                  </div>
                </form>
              )}
            </div>

            {/* ── Pinned bottom buttons ── */}
            <div className="shrink-0 flex gap-3" style={{ padding: '24px 20px 20px' }}>
              {status === 'success' ? (
                <Button layout="pill" variant="cyan" onClick={handleClose}>
                  Close
                </Button>
              ) : (
                <>
                  <Button layout="pill" variant="transparent" onClick={handleClose} disabled={status === 'loading'}>
                    Cancel
                  </Button>
                  <Button
                    form="invite-form"
                    type="submit"
                    layout="pill"
                    variant={isEmailValid ? 'lime' : 'cyan'}
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? (
                      <Loader2 className="w-5 h-5 animate-spin" color="#FFFFFF" />
                    ) : (
                      'Send Invite'
                    )}
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
