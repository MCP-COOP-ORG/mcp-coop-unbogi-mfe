import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Gift, LayoutGrid } from 'lucide-react-native';
import type React from 'react';
import { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useInviteModalStore, useSendModalStore } from '../store';
import { Button } from './Button';

const TAB_SIZE = 48;
const PILL_HEIGHT = 52;
const PILL_PADDING = 1; // 2px — equal gap on all sides
const TAB_GAP = 16;

// Matches TMA variant colors
const TAB_COLORS: Record<string, string> = {
  surprises: '#eb2d2d',
  collection: '#7ab648',
};

const ICON_MAP: Record<string, React.ElementType> = {
  surprises: Gift,
  collection: LayoutGrid,
};

export function BottomNav({ state, navigation }: BottomTabBarProps) {
  const { openInviteModal } = useInviteModalStore();
  const { openSendModal } = useSendModalStore();

  const tabs = state.routes.filter((route) => route.name === 'surprises' || route.name === 'collection');

  const activeFilteredIndex = tabs.findIndex(
    (route) => state.index === state.routes.findIndex((r) => r.key === route.key),
  );
  const safeIndex = Math.max(0, activeFilteredIndex);

  // One shared value drives the sliding button position (same idea as TMA layoutId)
  const slideX = useSharedValue(safeIndex * (TAB_SIZE + TAB_GAP));

  useEffect(() => {
    slideX.value = withTiming(safeIndex * (TAB_SIZE + TAB_GAP), {
      duration: 220,
      easing: Easing.out(Easing.quad),
    });
  }, [safeIndex, slideX]);

  const slidingStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }));

  const activeTabName = tabs[safeIndex]?.name ?? 'surprises';
  const activeColor = TAB_COLORS[activeTabName] ?? '#eb2d2d';

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Left — invite */}
      <View>
        <Button variant="orange" icon="UserPlus" onPress={openInviteModal} layout="circle" />
      </View>

      {/* Center — pill with sliding active button */}
      <View style={styles.pillContainer}>
        {/* Sliding colored button (with black border) — mimics TMA layoutId behaviour */}
        <Animated.View style={[styles.slidingButton, { backgroundColor: activeColor }, slidingStyle]} />

        {/* Transparent hit-targets with icons on top of the slider */}
        {tabs.map((route) => {
          const isFocused = state.index === state.routes.findIndex((r) => r.key === route.key);
          const IconComponent = ICON_MAP[route.name];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity key={route.key} style={styles.tabHitArea} onPress={onPress} activeOpacity={1}>
              {IconComponent && (
                <IconComponent color={isFocused ? '#1A1A1A' : '#33ccddff'} size={24} strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Right — send gift */}
      <View>
        <Button variant="cyan" icon="Send" onPress={openSendModal} layout="circle" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 50,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TAB_GAP,
    height: 54,
    borderRadius: PILL_HEIGHT / 2,
    padding: PILL_PADDING,
    backgroundColor: '#FFF5E1',
    borderWidth: 2,
    borderColor: '#1A1A1A',
    // no shadow — as requested
  },
  // The single animated element that slides between tab positions
  // It carries both the color fill AND the black border — exactly like TMA's layoutId pill
  slidingButton: {
    position: 'absolute',
    left: PILL_PADDING,
    top: PILL_PADDING,
    width: TAB_SIZE,
    height: TAB_SIZE,
    borderRadius: TAB_SIZE / 2,
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  // Transparent overlay — receives taps and shows icon, sits on top of the slider
  tabHitArea: {
    width: TAB_SIZE,
    height: TAB_SIZE,
    borderRadius: TAB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
