import { AUTH_STATUS, useAuthStore } from '@unbogi/shared';
import { useEffect } from 'react';
import { useT } from '@/hooks';
import { tg } from '@/lib';
import { LoginScreen, MainScreen } from '@/screens';
import { Button, LoadingSpinner } from '@/ui';

export function App() {
  const t = useT();
  const initAuth = useAuthStore((s) => s.initialize);
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    const unsubscribe = initAuth(tg.initData, tg.startParam);
    return () => unsubscribe();
  }, [initAuth]);

  const isAuthed = status === AUTH_STATUS.AUTHENTICATED;
  const isAuthError = status === AUTH_STATUS.AUTH_ERROR;

  return (
    <div
      className="relative flex flex-col h-full w-full overflow-hidden bg-purple-500 text-white"
      style={{
        backgroundImage: `
          radial-gradient(130vw 130vh at 0% 0%, rgba(15, 231, 234, 0.91) 0%, transparent 100%),
          radial-gradient(130vw 130vh at 100% 100%, rgba(221, 201, 19, 0.89) 0%, transparent 100%),
          radial-gradient(100vw 100vh at 50% 50%, rgba(106, 44, 164, 0.4) 0%, transparent 100%)
        `,
      }}
    >
      {/* Polka Dots Pattern */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(rgb(129 24 205 / 20%) 2px, transparent 2.5px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0px 0px',
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
          opacity: 0.9,
        }}
      />

      <div className="relative z-10 flex flex-col flex-1 h-full w-full">
        {isAuthError ? (
          <div className="flex flex-col items-center justify-center h-full w-full px-8 gap-5">
            <LoadingSpinner />
            <h2
              className="text-lg font-bold tracking-wide text-center"
              style={{ textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}
            >
              {t.authError.title}
            </h2>
            <p
              className="text-sm text-center max-w-[260px] opacity-60"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
            >
              {t.authError.description}
            </p>
            <div className="w-full max-w-[200px]">
              <Button layout="pill" variant="cyan" icon="RefreshCw" onClick={() => window.location.reload()}>
                {t.authError.retry}
              </Button>
            </div>
          </div>
        ) : isAuthed ? (
          <MainScreen />
        ) : (
          <LoginScreen />
        )}
      </div>
    </div>
  );
}
