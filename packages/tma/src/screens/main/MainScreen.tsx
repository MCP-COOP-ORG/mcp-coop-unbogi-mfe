import { SCREENS, useGiftModeStore, useInviteModalStore, useNavigationStore } from '@/store';
import { BottomNav, type BottomNavTab } from '@/ui';
import { GiftCarousel, InviteModal, SendForm } from './components';
import { collectionStrategy, type GiftScreenStrategy, surprisesStrategy } from './components/strategies';

const NAV_TABS: BottomNavTab<GiftScreenStrategy>[] = [
  { strategy: surprisesStrategy, id: surprisesStrategy.mode, icon: 'Gift', label: 'Surprises', variant: 'red' },
  {
    strategy: collectionStrategy,
    id: collectionStrategy.mode,
    icon: 'LayoutGrid',
    label: 'Collection',
    variant: 'lime',
  },
];

/**
 * MainScreen — authenticated app shell.
 *
 * Owns the full authenticated layout:
 *   - GiftCarousel  — gift slider (never unmounts, preserves scroll & timer state)
 *   - BottomNav     — tab + action buttons
 *   - InviteModal   — invite overlay
 *   - SendForm      — full-screen form overlay (conditionally rendered)
 */
export function MainScreen() {
  const isSendOpen = useNavigationStore((s) => s.activeScreen === SCREENS.SEND);
  const setScreen = useNavigationStore((s) => s.setScreen);
  const activeStrategy = useGiftModeStore((s) => s.strategy);
  const setStrategy = useGiftModeStore((s) => s.setStrategy);
  const openInviteModal = useInviteModalStore((s) => s.openInviteModal);

  return (
    <div className="flex flex-col h-full relative">
      {/* Persistent gift carousel — padding accounts for BottomNav height */}
      <main className="flex-1 flex flex-col overflow-hidden" style={{ padding: '20px 20px 120px' }}>
        <GiftCarousel />
      </main>

      <BottomNav
        tabs={NAV_TABS}
        activeTabId={activeStrategy.mode}
        onTabChange={setStrategy}
        onInviteClick={openInviteModal}
        onSendClick={() => setScreen(SCREENS.SEND)}
      />

      <InviteModal />

      {/* SendForm — full-screen overlay, mounted only when active */}
      {isSendOpen && (
        <div className="absolute inset-0 z-[100] bg-[var(--color-bg)]">
          <SendForm />
        </div>
      )}
    </div>
  );
}
