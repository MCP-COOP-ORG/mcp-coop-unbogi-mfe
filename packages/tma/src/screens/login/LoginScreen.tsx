import { AUTH_STATUS, useAuthStore } from '@unbogi/shared';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, Mail } from 'lucide-react';
import { useT } from '@/hooks/use-t';
import { IconButton } from '@/ui';
import { Input } from '@/ui/input';
import { OtpTimer } from './OtpTimer';
import { useAuthForm } from './useAuthForm';

export function LoginScreen() {
  const t = useT();
  const form = useAuthForm();
  const authStatus = useAuthStore((s) => s.status);
  const isGlobalLoading = authStatus === AUTH_STATUS.IDLE || authStatus === AUTH_STATUS.LOADING;

  const isEmailStep = form.step === 'email';

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 gap-2">
      {/* Logo & Title */}
      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
        className="w-28 h-28 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(147,51,234,0.3)] border border-purple-500/20"
      >
        <img src={`${import.meta.env.BASE_URL}icon.png`} alt="UnBoGi" className="w-full h-full object-cover" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-purple-400"
      >
        UnBoGi
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="text-sm uppercase tracking-[0.2em] text-[#c084fc] font-medium"
      >
        {t.auth.subtitle}
      </motion.p>

      {/* Input + Action Button (transitions between steps) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="flex gap-2 items-center w-full max-w-[320px] mt-4 min-h-[44px]"
      >
        <AnimatePresence mode="wait">
          {isGlobalLoading ? (
            <motion.div
              key="global-loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center items-center w-full"
            >
              <Loader2 className="w-6 h-6 animate-spin text-purple-400/60" />
            </motion.div>
          ) : isEmailStep ? (
            <motion.div
              key="email-input"
              className="flex-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                type="email"
                value={form.email}
                onChange={(e) => form.handleEmailChange(e.target.value)}
                onBlur={form.handleEmailBlur}
                onKeyDown={(e) => e.key === 'Enter' && form.handleSendEmail()}
                placeholder={t.auth.emailPlaceholder}
                icon={<Mail size={16} strokeWidth={1.5} />}
                disabled={form.isLoading}
                className={`flex-1 transition-colors ${form.errorToShow && !form.isEmailValid ? 'border-red-500/50 focus:border-red-500/80' : ''}`}
              />
            </motion.div>
          ) : (
            <motion.div
              key="code-input"
              className="flex-1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.code}
                onChange={(e) => form.handleCodeChange(e.target.value)}
                onBlur={form.handleCodeBlur}
                onKeyDown={(e) => e.key === 'Enter' && form.handleSubmitCode()}
                placeholder={t.auth.codePlaceholder}
                icon={
                  form.otpSentAt ? <OtpTimer sentAt={form.otpSentAt} onExpired={form.handleTimerExpired} /> : undefined
                }
                disabled={form.isLoading || form.otpExpired}
                className={`flex-1 transition-colors ${form.errorToShow && !form.isCodeValid ? 'border-red-500/50 focus:border-red-500/80' : ''}`}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        <AnimatePresence mode="wait">
          {!isGlobalLoading &&
            (isEmailStep ? (
              <motion.div
                key="btn-forward-email"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <IconButton
                  onClick={form.handleSendEmail}
                  disabled={!form.isEmailValid || form.isLoading}
                  aria-label="Send code"
                >
                  <ArrowRight size={16} strokeWidth={1.5} />
                </IconButton>
              </motion.div>
            ) : (
              <motion.div
                key="btn-forward-code"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <IconButton
                  onClick={form.handleSubmitCode}
                  disabled={!form.isCodeValid || form.isLoading || form.otpExpired}
                  aria-label="Submit code"
                >
                  <ArrowRight size={16} strokeWidth={1.5} />
                </IconButton>
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>

      {/* Email hint (Code step only) */}
      <AnimatePresence>
        {!isEmailStep && !form.otpExpired && (
          <motion.p
            key="email-hint"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-white/40 text-center mt-2 flex items-center justify-center gap-1"
          >
            <button
              onClick={form.handleBack}
              disabled={form.isLoading}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 opacity-80 hover:opacity-100"
              aria-label="Go back and change email"
            >
              <ArrowLeft size={12} />
              {t.auth.codeSent} <span className="text-white/80 underline decoration-white/30 underline-offset-2">{form.email}</span>
            </button>
          </motion.p>
        )}
      </AnimatePresence>

      {/* Dynamic Error Message */}
      <AnimatePresence mode="wait">
        {form.errorToShow && (
          <motion.p
            key="error-msg"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-red-400/80 text-center max-w-[260px] mt-2"
          >
            {form.errorToShow}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
