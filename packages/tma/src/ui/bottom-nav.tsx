import { motion } from 'framer-motion';
import { Gift, LayoutGrid, Send, UserPlus } from 'lucide-react';
import { useInviteModalStore, useGiftModeStore, SCREENS, useNavigationStore } from '@/store';
import { collectionStrategy, surprisesStrategy, type GiftScreenStrategy } from '@/screens/main/components/strategies';
import { tg } from '@/lib/telegram';
import { IconButton } from '@/ui';

// Tab definitions — each tab maps to a concrete strategy.
const tabs: { strategy: GiftScreenStrategy; Icon: typeof Gift; label: string }[] = [
  { strategy: surprisesStrategy,  Icon: Gift,        label: 'Surprises'  },
  { strategy: collectionStrategy, Icon: LayoutGrid,  label: 'Collection' },
];

export function BottomNav() {
  const activeStrategy = useGiftModeStore((s) => s.strategy);
  const setStrategy    = useGiftModeStore((s) => s.setStrategy);
  const setScreen      = useNavigationStore((s) => s.setScreen);
  const openInviteModal = useInviteModalStore((s) => s.openInviteModal);

  const handleTabTap = (strategy: GiftScreenStrategy) => {
    tg.haptic('light');
    // Switch strategy first, then ensure MAIN is active.
    // If the user was on SendScreen this brings them back to MainScreen.
    setStrategy(strategy);
    setScreen(SCREENS.MAIN);
  };

  const handleUserAction = () => {
    tg.haptic('light');
    openInviteModal();
  };

  return (
    <div
      style={{ padding: '20px 40px' }}
      className="absolute bottom-0 left-0 w-full z-50 flex items-center justify-between pointer-events-none box-border"
    >
      {/* Left — invite / profile action */}
      <div className="pointer-events-auto">
        <IconButton onClick={handleUserAction} aria-label="Profile or Invite">
          <UserPlus size={16} strokeWidth={2.5} />
        </IconButton>
      </div>

      {/* Center — sliding tab bar (strategy selector) */}
      <div className="pointer-events-auto flex items-center h-[38px] bg-black/20 backdrop-blur-[40px] backdrop-saturate-[180%] rounded-full p-1 border-[0.5px] border-white/[0.18] shadow-[0_8px_32px_rgba(0,0,0,0.12)] relative overflow-hidden">
        {tabs.map(({ strategy, Icon }) => {
          const isActive = activeStrategy.mode === strategy.mode;
          return (
            <button
              key={strategy.mode}
              type="button"
              onClick={() => handleTabTap(strategy)}
              className="relative w-16 h-full flex items-center justify-center rounded-full transition-colors z-10 outline-none"
              aria-label={strategy.mode}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-pill"
                  className="absolute inset-0 bg-white/15 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={16}
                strokeWidth={2.5}
                className={`relative z-20 transition-colors ${isActive ? 'text-white' : 'text-white/40'}`}
              />
            </button>
          );
        })}
      </div>

      {/* Right — send gift action */}
      <div className="pointer-events-auto">
        <IconButton onClick={() => { tg.haptic('light'); setScreen(SCREENS.SEND); }} aria-label="Send Gift">
          <Send size={16} strokeWidth={2.5} />
        </IconButton>
      </div>
    </div>
  );
}
