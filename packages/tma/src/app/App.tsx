import { useEffect } from 'react';
import { useAuthStore, AUTH_STATUS } from '@unbogi/shared';
import { SurprisesScreen } from '@/screens/surprises/SurprisesScreen';
import { CollectionScreen } from '@/screens/collection/CollectionScreen';
import { SendScreen } from '@/screens/send/SendScreen';
import { BottomNav } from '@/ui/bottom-nav';
import { useNavigationStore, type ScreenId } from '@/app/navigation';

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
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, [initAuth]);

  if (status === AUTH_STATUS.IDLE || status === AUTH_STATUS.LOADING) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white/50 text-sm">Loading...</div>
      </div>
    );
  }

  if (status === AUTH_STATUS.UNAUTHENTICATED) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white/50 text-sm">Authentication required</div>
      </div>
    );
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
