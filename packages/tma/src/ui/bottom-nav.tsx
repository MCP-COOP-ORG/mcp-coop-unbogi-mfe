import { motion } from 'framer-motion';
import { Gift, LayoutGrid } from 'lucide-react';
import { tg } from '@/lib/telegram';
import { collectionStrategy, type GiftScreenStrategy, surprisesStrategy } from '@/screens/main/components/strategies';
import { SCREENS, useGiftModeStore, useInviteModalStore, useNavigationStore } from '@/store';
import { CircleButton } from '@/ui';
import { type CircleButtonVariant, circleButtonTheme } from './circle-button';

// Tab definitions — each tab maps to a concrete strategy and variant
const tabs: { strategy: GiftScreenStrategy; Icon: typeof Gift; label: string; variant: CircleButtonVariant }[] = [
  { strategy: surprisesStrategy, Icon: Gift, label: 'Surprises', variant: 'red' },
  { strategy: collectionStrategy, Icon: LayoutGrid, label: 'Collection', variant: 'orange' },
];

export function BottomNav() {
  const activeStrategy = useGiftModeStore((s) => s.strategy);
  const setStrategy = useGiftModeStore((s) => s.setStrategy);
  const setScreen = useNavigationStore((s) => s.setScreen);
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
        <CircleButton variant="lime" icon="UserPlus" onClick={handleUserAction} aria-label="Profile or Invite" />
      </div>

      {/* Center — sliding tab bar (strategy selector) */}
      <div className="pointer-events-auto flex items-center h-[56px] rounded-[28px] p-1 relative overflow-hidden bg-[#FFF5E1] border-2 border-[#FFD1B3] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        {tabs.map(({ strategy, Icon, variant }) => {
          const isActive = activeStrategy.mode === strategy.mode;
          const t = circleButtonTheme[variant];

          return (
            <button
              key={strategy.mode}
              type="button"
              onClick={() => handleTabTap(strategy)}
              className="relative w-12 h-12 flex items-center justify-center rounded-full z-10 outline-none select-none"
              aria-label={strategy.mode}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-pill"
                  className="absolute inset-0 rounded-full"
                  initial={{ background: t.bg, boxShadow: t.normalShadow }}
                  animate={{ background: t.bg, boxShadow: t.normalShadow }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              )}
              <Icon
                size={26}
                strokeWidth={2}
                color={isActive ? '#FFFFFF' : '#63D2D6'} // Cyan for inactive
                style={{
                  filter: isActive ? 'drop-shadow(0px 1px 2px rgba(0,0,0,0.25))' : 'none',
                }}
                className="relative z-20 transition-all duration-300"
              />
            </button>
          );
        })}
      </div>

      {/* Right — send gift action */}
      <div className="pointer-events-auto">
        <CircleButton
          variant="cyan"
          icon="Send"
          onClick={() => {
            tg.haptic('light');
            setScreen(SCREENS.SEND);
          }}
          aria-label="Send Gift"
        />
      </div>
    </div>
  );
}
