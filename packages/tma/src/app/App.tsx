import { AUTH_STATUS, useAuthStore } from '@unbogi/shared';
import { useEffect } from 'react';
import { tg } from '@/lib/telegram';
import { LoginScreen } from '@/screens/login/LoginScreen';
import { MainScreen } from '@/screens/main/MainScreen';

// ⚡ Feature flag: set to `true` to bypass auth locally
const SKIP_AUTH = false;

export function App() {
  const initAuth = useAuthStore((s) => s.initialize);
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (SKIP_AUTH) return;
    const unsubscribe = initAuth(tg.initData, tg.startParam);
    return () => unsubscribe();
  }, [initAuth]);

  const isAuthed = SKIP_AUTH || status === AUTH_STATUS.AUTHENTICATED;
  return isAuthed ? <MainScreen /> : <LoginScreen />;
}
