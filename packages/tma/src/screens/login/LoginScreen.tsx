import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import { IconButton } from '@/ui';
import { Input } from '@/ui/input';
import { useT } from '@/hooks/use-t';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const t = useT();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 gap-2">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="flex gap-2 items-center w-full max-w-[320px]"
      >
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.auth.emailPlaceholder}
          icon={<Mail size={16} strokeWidth={1.5} />}
          className="flex-1"
        />
        <IconButton>
          <ArrowRight size={16} strokeWidth={1.5} />
        </IconButton>
      </motion.div>
    </div>
  );
}
