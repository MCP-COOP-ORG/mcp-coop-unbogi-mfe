import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuthStore, AUTH_STATUS } from '@unbogi/shared';
import { LoginScreen } from '@/screens/login/LoginScreen';
import { SurprisesScreen } from '@/screens/surprises/SurprisesScreen';
import { CollectionScreen } from '@/screens/collection/CollectionScreen';
import { SendScreen } from '@/screens/send/SendScreen';
import { BottomNav } from '@/ui/bottom-nav';
import { useNavigationStore, type ScreenId } from '@/app/navigation';
import { tg } from '@/lib/telegram';

function ActiveScreen({ screenId }: { screenId: ScreenId }) {
  switch (screenId) {
    case 'surprises':
      return <SurprisesScreen />;
    case 'collection':
      return <CollectionScreen />;
    case 'send':
      return <SendScreen />;
  }
}

export function App() {
  const initAuth = useAuthStore((s) => s.initialize);
  const status = useAuthStore((s) => s.status);
  const activeScreen = useNavigationStore((s) => s.activeScreen);

  useEffect(() => {
    // Передаём tg.initData — store запустит telegramAuth и определит нужен ли OTP
    const unsubscribe = initAuth(tg.initData);
    return () => unsubscribe();
  }, [initAuth]);

  if (status === AUTH_STATUS.IDLE || status === AUTH_STATUS.LOADING) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-purple-400/60" />
      </div>
    );
  }

  // Показываем LoginScreen как при email_required так и при unauthenticated
  if (status === AUTH_STATUS.EMAIL_REQUIRED || status === AUTH_STATUS.UNAUTHENTICATED) {
    return <LoginScreen />;
  }

  return (
    <div className="flex flex-col h-full relative">
      <main className="flex-1 overflow-y-auto">
        <ActiveScreen screenId={activeScreen} />
      </main>
      <BottomNav />
    </div>
  );
}
