import { AUTH_STATUS, useAuthStore } from '@unbogi/shared';
import { useEffect } from 'react';
import { type ScreenId, useNavigationStore } from '@/app/navigation';
import { tg } from '@/lib/telegram';
import { CollectionScreen } from '@/screens/collection/CollectionScreen';
import { LoginScreen } from '@/screens/login/LoginScreen';
import { SendScreen } from '@/screens/send/SendScreen';
import { SurprisesScreen } from '@/screens/surprises/SurprisesScreen';
import { BottomNav } from '@/ui/bottom-nav';

function ActiveScreen({ screenId }: { screenId: ScreenId }) {
  switch (screenId) {
    case 'surprises':
      return <SurprisesScreen />;
    case 'collection':
      return <CollectionScreen />;
    case 'send':
      return <SendScreen />;
    default:
      return null;
  }
}

export function App() {
  const initAuth = useAuthStore((s) => s.initialize);
  const status = useAuthStore((s) => s.status);
  const activeScreen = useNavigationStore((s) => s.activeScreen);

  useEffect(() => {
    const unsubscribe = initAuth(tg.initData);
    return () => unsubscribe();
  }, [initAuth]);

  if (status === AUTH_STATUS.AUTHENTICATED) {
    return (
      <div className="flex flex-col h-full relative">
        <main className="flex-1 overflow-y-auto">
          <ActiveScreen screenId={activeScreen} />
        </main>
        <BottomNav />
      </div>
    );
  }

  return <LoginScreen />;
}
