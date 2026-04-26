import { AUTH_STATUS, useAuthStore } from '@unbogi/shared';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Mail } from 'lucide-react';
import { useT } from '@/hooks/use-t';
import { ASSETS } from '@/lib/assets';
import { Button } from '@/ui';
import { Input } from '@/ui/input';
import { OtpTimer, useAuthForm } from './components';

export function LoginScreen() {
  const t = useT();
  const form = useAuthForm();
  const authStatus = useAuthStore((s) => s.status);
  const isGlobalLoading = authStatus === AUTH_STATUS.IDLE || authStatus === AUTH_STATUS.LOADING;

  const isEmailStep = form.step === 'email';

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full px-6 gap-2">
      {/* Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
        className="w-[240px] h-[240px] bg-contain bg-center bg-no-repeat shrink-0"
        style={{ backgroundImage: `url(${ASSETS.LOGO})` }}
      />

      {/* Input + Action Button (transitions between steps) */}
      <div className="w-full max-w-[320px] mt-4 min-h-[44px]">
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
              key="email-block"
              className="flex gap-2 items-start w-full"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex-1 min-w-0">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => form.handleEmailChange(e.target.value)}
                  onBlur={form.handleEmailBlur}
                  onKeyDown={(e) => e.key === 'Enter' && form.handleSendEmail()}
                  placeholder={t.auth.emailPlaceholder}
                  leftIcon={<Mail size={24} strokeWidth={2.5} />}
                  disabled={form.isLoading}
                  variant={form.errorToShow ? 'error' : 'normal'}
                  error={form.errorToShow || undefined}
                />
              </div>
              <div className="w-12 shrink-0 flex justify-center">
                <Button
                  variant="cyan"
                  icon="ChevronRight"
                  onClick={form.handleSendEmail}
                  status={form.isLoading ? 'loading' : !form.isEmailValid ? 'disabled' : 'idle'}
                  aria-label="Send code"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="code-block"
              className="flex gap-2 items-start w-full"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex-1 min-w-0">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.code}
                  onChange={(e) => form.handleCodeChange(e.target.value)}
                  onBlur={form.handleCodeBlur}
                  onKeyDown={(e) => e.key === 'Enter' && form.handleSubmitCode()}
                  placeholder={t.auth.codePlaceholder}
                  rightIcon={
                    form.otpSentAt ? (
                      <OtpTimer sentAt={form.otpSentAt} onExpired={form.handleTimerExpired} />
                    ) : undefined
                  }
                  disabled={form.isLoading || form.otpExpired}
                  variant={form.errorToShow ? 'error' : 'normal'}
                  error={form.errorToShow || undefined}
                  className="[&_input]:text-center [&_input]:font-bold [&_input]:tracking-widest [&_input]:text-[20px] [&_input]:placeholder:tracking-normal [&_input]:placeholder:text-[16px] [&_input]:placeholder:font-medium"
                />
              </div>
              <div className="w-12 shrink-0 flex justify-center">
                <Button
                  layout="circle"
                  variant={form.isCodeValid && !form.otpExpired ? 'lime' : 'red'}
                  icon={form.isCodeValid && !form.otpExpired ? 'Check' : 'ArrowLeft'}
                  onClick={form.isCodeValid && !form.otpExpired ? form.handleSubmitCode : form.handleBack}
                  status={form.isLoading ? 'loading' : 'idle'}
                  aria-label={form.isCodeValid && !form.otpExpired ? 'Submit code' : 'Go back'}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Code sent hint text */}
      <AnimatePresence>
        {!isEmailStep && !isGlobalLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="-mt-2 text-center relative z-10 drop-shadow-sm"
          >
            <p
              className="text-[16px] tracking-[0.15em] font-bold"
              style={{ color: 'rgba(43, 42, 44, 0.8)', textShadow: '0 1px 3px rgba(255, 255, 255, 0.8)' }}
            >
              {t.auth.codeSent} <span style={{ color: '#2b2a2c', textTransform: 'uppercase' }}>{form.email}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
