import { AUTH_STATUS, useAuthStore } from '@unbogi/shared';
import { useEffect } from 'react';
import { SCREENS, type ScreenId, useNavigationStore } from '@/app/navigation';
import { tg } from '@/lib/telegram';
import { CollectionScreen } from '@/screens/collection/CollectionScreen';
import { LoginScreen } from '@/screens/login/LoginScreen';
import { SendScreen } from '@/screens/send/SendScreen';
import { SurprisesScreen } from '@/screens/surprises/SurprisesScreen';
import { BottomNav } from '@/ui/bottom-nav';

// ⚡ Feature flag: set to `true` to bypass auth locally
const SKIP_AUTH = false;

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
    if (SKIP_AUTH) return;
    const unsubscribe = initAuth(tg.initData);
    return () => unsubscribe();
  }, [initAuth]);

  const isAuthed = SKIP_AUTH || status === AUTH_STATUS.AUTHENTICATED;
  const isSendScreen = activeScreen === SCREENS.SEND;

  if (isAuthed) {
    return (
      <div className="flex flex-col h-full relative">
        <main
          className={`flex-1 ${isSendScreen ? 'overflow-hidden' : 'flex flex-col overflow-hidden'}`}
          style={isSendScreen ? undefined : { padding: '20px 20px 100px' }}
        >
          <ActiveScreen screenId={activeScreen} />
        </main>
        {!isSendScreen && <BottomNav />}
      </div>
    );
  }

  return <LoginScreen />;
}
