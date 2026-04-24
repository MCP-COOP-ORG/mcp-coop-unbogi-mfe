import { SCREENS, useNavigationStore } from '@/store';
import { BottomNav } from '@/ui';
import { InviteModal } from '@/ui/invite-modal';
import { GiftCarousel, SendForm } from './components';

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

  return (
    <div className="flex flex-col h-full relative">
      {/* Persistent gift carousel — padding accounts for BottomNav height */}
      <main className="flex-1 flex flex-col overflow-hidden" style={{ padding: '120px 20px' }}>
        <GiftCarousel />
      </main>

      <BottomNav />
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
