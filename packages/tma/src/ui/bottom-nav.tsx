import { tg } from '@/lib/telegram';
import { collectionStrategy, type GiftScreenStrategy, surprisesStrategy } from '@/screens/main/components/strategies';
import { SCREENS, useGiftModeStore, useInviteModalStore, useNavigationStore } from '@/store';
import { Button, type ButtonIcon, type ButtonVariant } from './button';

/** layoutId shared across all tab buttons — framer-motion slides the background between them. */
const TAB_LAYOUT_ID = 'bottom-nav-tab-pill';

const tabs: { strategy: GiftScreenStrategy; icon: ButtonIcon; label: string; variant: ButtonVariant }[] = [
  { strategy: surprisesStrategy,  icon: 'Gift',       label: 'Surprises',  variant: 'red'  },
  { strategy: collectionStrategy, icon: 'LayoutGrid',  label: 'Collection', variant: 'lime' },
];

export function BottomNav() {
  const activeStrategy = useGiftModeStore((s) => s.strategy);
  const setStrategy    = useGiftModeStore((s) => s.setStrategy);
  const setScreen      = useNavigationStore((s) => s.setScreen);
  const openInviteModal = useInviteModalStore((s) => s.openInviteModal);

  const handleTabTap = (strategy: GiftScreenStrategy) => {
    tg.haptic('light');
    setStrategy(strategy);
    setScreen(SCREENS.MAIN);
  };

  return (
    <div
      style={{ padding: '20px 40px' }}
      className="absolute bottom-0 left-0 w-full z-50 flex items-center justify-between pointer-events-none box-border"
    >
      {/* Left — invite */}
      <div className="pointer-events-auto">
        <Button variant="orange" icon="UserPlus" onClick={() => { tg.haptic('light'); openInviteModal(); }} aria-label="Profile or Invite" />
      </div>

      {/* Center — sliding tab bar */}
      <div className="pointer-events-auto flex items-center gap-3 h-[56px] rounded-[28px] p-[7px] relative overflow-hidden bg-[#FFF5E1] border-2 border-[#FFD1B3] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        {tabs.map(({ strategy, icon, variant, label }) => (
          <Button
            key={strategy.mode}
            variant={variant}
            icon={icon}
            layoutId={TAB_LAYOUT_ID}
            isActive={activeStrategy.mode === strategy.mode}
            onClick={() => handleTabTap(strategy)}
            aria-label={label}
          />
        ))}
      </div>

      {/* Right — send gift */}
      <div className="pointer-events-auto">
        <Button
          variant="cyan"
          icon="Send"
          onClick={() => { tg.haptic('light'); setScreen(SCREENS.SEND); }}
          aria-label="Send Gift"
        />
      </div>
    </div>
  );
}
