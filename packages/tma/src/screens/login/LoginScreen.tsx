import { AUTH_STATUS, useAuthStore } from '@unbogi/shared';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Mail } from 'lucide-react';
import { useT } from '@/hooks/use-t';
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
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5, type: 'spring' }}
        className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-rose-400 to-fuchsia-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)] pb-1"
        style={{
          fontFamily: '"Fredoka", "Nunito", "Baloo 2", "Comic Sans MS", sans-serif',
          WebkitTextStroke: '2px rgb(96 2 165)',
        }}
      >
        UnBoGi
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="text-[14px] uppercase tracking-[0.2em] font-bold"
        style={{
          color: '#2b2a2c',
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
        }}
      >
        {t.auth.subtitle}
      </motion.p>

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
                  leftIcon={<Mail size={20} strokeWidth={1.5} />}
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
                  disabled={!form.isEmailValid || form.isLoading}
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
                  disabled={form.isLoading}
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
              className="text-[16px] font-bold text-[#2b2a2c]/80"
              style={{ textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)' }}
            >
              {t.auth.codeSent} <span className="font-black text-[#2b2a2c]">{form.email}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
