import { motion } from 'framer-motion';
import { Gift, LayoutGrid, Send, UserPlus } from 'lucide-react';
import { useInviteModalStore } from '@/app/inviteModalStore';
import { SCREENS, type ScreenId, useNavigationStore } from '@/app/navigation';
import { tg } from '@/lib/telegram';
import { IconButton } from '@/ui';

const tabs = [
  { id: SCREENS.SURPRISES, Icon: Gift, label: 'Surprises' },
  { id: SCREENS.COLLECTION, Icon: LayoutGrid, label: 'Collection' },
] as const;

export function BottomNav() {
  const activeScreen = useNavigationStore((s) => s.activeScreen);
  const setScreen = useNavigationStore((s) => s.setScreen);
  const openInviteModal = useInviteModalStore((s) => s.openInviteModal);

  const handleTap = (id: ScreenId) => {
    tg.haptic('light');
    setScreen(id);
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
      {/* Left Action Button */}
      <div className="pointer-events-auto">
        <IconButton onClick={handleUserAction} aria-label="Profile or Invite">
          <UserPlus size={16} strokeWidth={2.5} />
        </IconButton>
      </div>

      {/* Center Sliding Tabbar */}
      <div className="pointer-events-auto flex items-center h-[38px] bg-black/20 backdrop-blur-[40px] backdrop-saturate-[180%] rounded-full p-1 border-[0.5px] border-white/[0.18] shadow-[0_8px_32px_rgba(0,0,0,0.12)] relative overflow-hidden">
        {tabs.map(({ id, Icon }) => {
          const isActive = activeScreen === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleTap(id)}
              className="relative w-16 h-full flex items-center justify-center rounded-full transition-colors z-10 outline-none"
              aria-label={id}
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

      {/* Right Action Button */}
      <div className="pointer-events-auto">
        <IconButton onClick={() => handleTap(SCREENS.SEND)} aria-label="Send Gift">
          <Send size={16} strokeWidth={2.5} />
        </IconButton>
      </div>
    </div>
  );
}
