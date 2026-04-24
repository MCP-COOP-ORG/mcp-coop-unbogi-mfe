import { AUTH_STATUS, useAuthStore } from '@unbogi/shared';
import { useEffect } from 'react';
import { tg } from '@/lib/telegram';
import { LoginScreen } from '@/screens/login/LoginScreen';
import { MainScreen } from '@/screens/main/MainScreen';

export function App() {
  const initAuth = useAuthStore((s) => s.initialize);
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    const unsubscribe = initAuth(tg.initData, tg.startParam);
    return () => unsubscribe();
  }, [initAuth]);

  const isAuthed = status === AUTH_STATUS.AUTHENTICATED;
  return (
    <div
      className="relative flex flex-col h-full w-full overflow-hidden bg-purple-500 text-white"
      style={{
        backgroundImage: `
          radial-gradient(130vw 130vh at 0% 0%, rgba(15, 231, 234, 0.91) 0%, transparent 100%),
          radial-gradient(130vw 130vh at 100% 100%, rgba(221, 201, 19, 0.89) 0%, transparent 100%),
          radial-gradient(100vw 100vh at 50% 50%, rgba(106, 44, 164, 0.4) 0%, transparent 100%)
        `
      }}
    >
      {/* 2. Polka Dots Pattern */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(rgb(129 24 205 / 20%) 2px, transparent 2.5px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "0px 0px"
        }}
      />

      {/* Cake Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url('${import.meta.env.BASE_URL}bg-pattern-3.png')`,
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center center',
          backgroundSize: '180px',
          opacity: 0.9
        }}
      />

      <div className="relative z-10 flex flex-col flex-1 h-full w-full">
        {isAuthed ? <MainScreen /> : <LoginScreen />}
      </div>
    </div>
  );
}
