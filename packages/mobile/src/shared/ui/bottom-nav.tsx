import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Gift, LayoutGrid, Send, UserPlus } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useModalStore } from '@/store';
import { colors, iconDefaults, spacing } from '@/theme';
import { Button } from './button';

// ── Config ──────────────────────────────────────────────────────────────────────

const TAB_SIZE = 48;
const PILL_HEIGHT = 52;
const PILL_PADDING = 1;
const TAB_GAP = 16;

/** Tab configuration — maps route name to color + icon */
const TAB_CONFIG: Record<string, { color: string; icon: React.ElementType }> = {
  surprises: { color: colors.buttonRed, icon: Gift },
  collection: { color: colors.buttonLime, icon: LayoutGrid },
};

// ── Component ───────────────────────────────────────────────────────────────────

function BottomNavComponent({ state, navigation }: BottomTabBarProps) {
  const open = useModalStore((s) => s.open);
  const insets = useSafeAreaInsets();

  const tabs = state.routes.filter((route) => route.name in TAB_CONFIG);

  const activeFilteredIndex = tabs.findIndex(
    (route) => state.index === state.routes.findIndex((r) => r.key === route.key),
  );
  const safeIndex = Math.max(0, activeFilteredIndex);

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
  const activeColor = TAB_CONFIG[activeTabName]?.color ?? colors.buttonRed;

  return (
    <View style={[styles.container, { bottom: insets.bottom + spacing.md }]} pointerEvents="box-none">
      {/* Left — invite */}
      <View>
        <Button variant="orange" icon={UserPlus} onPress={() => open('invite')} layout="circle" />
      </View>

      {/* Center — pill with sliding active button */}
      <View style={styles.pillContainer}>
        <Animated.View style={[styles.slidingButton, { backgroundColor: activeColor }, slidingStyle]} />

        {tabs.map((route) => {
          const isFocused = state.index === state.routes.findIndex((r) => r.key === route.key);
          const config = TAB_CONFIG[route.name];
          const IconComponent = config?.icon;

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
            <Pressable
              key={route.key}
              style={styles.tabHitArea}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              android_ripple={{ color: colors.overlayLight, borderless: true, radius: TAB_SIZE / 2 }}
            >
              {IconComponent && (
                <IconComponent
                  color={isFocused ? colors.ink : colors.tabInactive}
                  size={iconDefaults.size}
                  strokeWidth={iconDefaults.strokeWidth}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Right — send gift */}
      <View>
        <Button variant="cyan" icon={Send} onPress={() => open('send')} layout="circle" />
      </View>
    </View>
  );
}

export const BottomNav = React.memo(BottomNavComponent);

// ── Styles ──────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg - 4,
    right: spacing.lg - 4,
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
    backgroundColor: colors.cream,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  slidingButton: {
    position: 'absolute',
    left: PILL_PADDING,
    top: PILL_PADDING,
    width: TAB_SIZE,
    height: TAB_SIZE,
    borderRadius: TAB_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  tabHitArea: {
    width: TAB_SIZE,
    height: TAB_SIZE,
    borderRadius: TAB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
