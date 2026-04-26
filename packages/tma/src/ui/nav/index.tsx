import { tg, withHaptic } from '@/lib';
import { Button, type ButtonIcon, type ButtonVariant } from '../elements/button';

/** layoutId shared across all tab buttons — framer-motion slides the background between them. */
const TAB_LAYOUT_ID = 'bottom-nav-tab-pill';

export interface BottomNavTab<T> {
  strategy: T;
  id: string;
  icon: ButtonIcon;
  label: string;
  variant: ButtonVariant;
}

export interface BottomNavProps<T> {
  tabs: BottomNavTab<T>[];
  activeTabId: string;
  onTabChange: (strategy: T) => void;
  onInviteClick: () => void;
  onSendClick: () => void;
}

export function BottomNav<T>({ tabs, activeTabId, onTabChange, onInviteClick, onSendClick }: BottomNavProps<T>) {
  const handleTabTap = (strategy: T) => {
    tg.haptic('light');
    onTabChange(strategy);
  };

  return (
    <div
      style={{ padding: '20px 40px' }}
      className="absolute bottom-0 left-0 w-full z-50 flex items-center justify-between pointer-events-none box-border"
    >
      {/* Left — invite */}
      <div className="pointer-events-auto">
        <Button variant="orange" icon="UserPlus" onClick={withHaptic(onInviteClick)} aria-label="Profile or Invite" />
      </div>

      {/* Center — sliding tab bar */}
      <div className="pointer-events-auto flex items-center gap-3 h-[52px] rounded-[26px] p-[5px] relative overflow-hidden bg-[#FFF5E1] shadow-[0_0_0_1px_#1A1A1A,0_0_0_3px_#FFD1B3,0_0_0_4px_#1A1A1A,0_2px_12px_rgba(0,0,0,0.08)]">
        {tabs.map(({ strategy, id, icon, variant, label }) => (
          <Button
            key={id}
            variant={variant}
            icon={icon}
            layoutId={TAB_LAYOUT_ID}
            isActive={activeTabId === id}
            onClick={() => handleTabTap(strategy)}
            aria-label={label}
          />
        ))}
      </div>

      {/* Right — send gift */}
      <div className="pointer-events-auto">
        <Button variant="cyan" icon="Send" onClick={withHaptic(onSendClick)} aria-label="Send Gift" />
      </div>
    </div>
  );
}
