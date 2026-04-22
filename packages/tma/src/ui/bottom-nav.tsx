import { Gift, LayoutGrid, Send } from 'lucide-react';
import { SCREENS, type ScreenId, useNavigationStore } from '@/app/navigation';
import { tg } from '@/lib/telegram';

const tabs = [
  { id: SCREENS.COLLECTION, Icon: LayoutGrid, label: 'Collection' },
  { id: SCREENS.SURPRISES, Icon: Gift, label: 'Surprises' },
  { id: SCREENS.SEND, Icon: Send, label: 'Send' },
] as const;

export function BottomNav() {
  const activeScreen = useNavigationStore((s) => s.activeScreen);
  const setScreen = useNavigationStore((s) => s.setScreen);

  const handleTap = (id: ScreenId) => {
    tg.haptic('light');
    setScreen(id);
  };

  return (
    <nav className="flex items-center justify-around py-3 px-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
      {tabs.map(({ id, Icon, label }) => {
        const isActive = activeScreen === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => handleTap(id)}
            className={`flex flex-col items-center gap-1 transition-all ${
              isActive ? 'text-white scale-105' : 'text-white/40'
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
