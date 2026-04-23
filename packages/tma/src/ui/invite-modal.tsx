import { invitesApi } from '@unbogi/shared';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Loader2, Mail, X } from 'lucide-react';
import { useState } from 'react';
import { useInviteModalStore } from '@/app/inviteModalStore';
import { IconButton, Input } from '@/ui';

export function InviteModal() {
  const { isInviteModalOpen, closeInviteModal } = useInviteModalStore();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
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
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Failed to send invite');
    }
  };

  const handleClose = () => {
    closeInviteModal();
    setStatus('idle');
    setEmail('');
    setErrorMessage('');
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
              'rounded-[24px] overflow-hidden',
              'bg-white/[0.08] backdrop-blur-[40px] backdrop-saturate-[180%]',
              'border-[0.5px] border-white/[0.18]',
              'shadow-[0_24px_64px_rgba(0,0,0,0.6),inset_0_0.5px_0_rgba(255,255,255,0.2)]',
            ].join(' ')}
          >
            <div className="flex-1 flex flex-col gap-6" style={{ padding: '20px 20px 0' }}>
              {/* ── Close + Title ── */}
              <div className="relative flex items-center justify-center">
                <div className="absolute left-0">
                  <IconButton onClick={handleClose} aria-label="Close">
                    <X size={18} strokeWidth={2.5} />
                  </IconButton>
                </div>
                <h1 className="text-[17px] font-semibold text-white">Invite a Friend</h1>
              </div>

              {/* ── Content ── */}
              <p className="text-[14px] text-white/60 text-center">
                Send an exclusive invitation link directly to their email.
              </p>

              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-8"
                >
                  <CheckCircle className="w-12 h-12 text-[#10b981] mb-2" strokeWidth={1.5} />
                  <p className="text-white/90 font-medium">Invite Sent!</p>
                </motion.div>
              ) : (
                <form id="invite-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="relative">
                    <Input
                      type="email"
                      icon={<Mail size={15} strokeWidth={2} />}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === 'error') setStatus('idle');
                      }}
                      placeholder="friend@example.com"
                      disabled={status === 'loading'}
                      className={status === 'error' ? 'border-red-400/50 focus-within:border-red-400/80' : ''}
                    />
                    <AnimatePresence>
                      {status === 'error' && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute -bottom-[18px] left-5 text-red-400 text-[11px] leading-none z-10"
                        >
                          {errorMessage}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </form>
              )}
            </div>

            {/* ── Pinned bottom buttons ── */}
            <div className="shrink-0 flex gap-3" style={{ padding: 20 }}>
              {status === 'success' ? (
                <button
                  type="button"
                  onClick={handleClose}
                  className={[
                    'flex-1 h-[38px] rounded-full text-[14px] font-medium cursor-pointer',
                    'bg-white/[0.08]',
                    'backdrop-blur-[40px] backdrop-saturate-[180%]',
                    'border-[0.5px] border-white/[0.18]',
                    'shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_0.5px_0_rgba(255,255,255,0.2)]',
                    'text-white/90',
                    'active:scale-[0.97] active:bg-white/[0.14] transition-all duration-150',
                  ].join(' ')}
                >
                  Close
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleClose}
                    className={[
                      'flex-1 h-[38px] rounded-full text-[14px] font-medium cursor-pointer',
                      'bg-white/[0.08]',
                      'backdrop-blur-[40px] backdrop-saturate-[180%]',
                      'border-[0.5px] border-white/[0.18]',
                      'shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_0.5px_0_rgba(255,255,255,0.2)]',
                      'text-white/60',
                      'active:scale-[0.97] active:bg-white/[0.14] transition-all duration-150',
                      'disabled:opacity-30 disabled:pointer-events-none',
                    ].join(' ')}
                    disabled={status === 'loading'}
                  >
                    Cancel
                  </button>
                  <button
                    form="invite-form"
                    type="submit"
                    disabled={status === 'loading' || !email}
                    className={[
                      'flex-1 h-[38px] rounded-full text-[14px] font-medium cursor-pointer',
                      'bg-white/[0.08]',
                      'backdrop-blur-[40px] backdrop-saturate-[180%]',
                      'border-[0.5px] border-white/[0.18]',
                      'shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_0.5px_0_rgba(255,255,255,0.2)]',
                      'text-white/90',
                      'active:scale-[0.97] active:bg-white/[0.14] transition-all duration-150',
                      'disabled:opacity-30 disabled:pointer-events-none',
                      'flex items-center justify-center',
                    ].join(' ')}
                  >
                    {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin text-white/90" /> : 'Send Invite'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
