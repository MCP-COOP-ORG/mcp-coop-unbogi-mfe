import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useInviteModalStore, useSendModalStore } from '../store';
import { Button } from './Button';

export function BottomNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const { openInviteModal } = useInviteModalStore();
  const { openSendModal } = useSendModalStore();

  const onInviteClick = () => {
    openInviteModal();
  };

  const onSendClick = () => {
    openSendModal();
  };

  // Filter out any hidden routes (like the default index if not meant to be a tab)
  // For this app, only "surprises" and "collection" should be visible in the pill
  const tabs = state.routes.filter((route) => route.name === 'surprises' || route.name === 'collection');

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Left — invite */}
      <View style={styles.sideButton}>
        <Button variant="orange" icon="UserPlus" onPress={onInviteClick} layout="circle" />
      </View>

      {/* Center — sliding tab bar */}
      <View style={styles.pillContainer}>
        {tabs.map((route) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === state.routes.findIndex((r) => r.key === route.key);
          const icon = route.name === 'surprises' ? 'Gift' : 'LayoutGrid';
          const variant = route.name === 'surprises' ? 'red' : 'lime';

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
            <Button
              key={route.key}
              variant={variant as any}
              icon={icon as any}
              isTab
              isActive={isFocused}
              onPress={onPress}
            />
          );
        })}
      </View>

      {/* Right — send gift */}
      <View style={styles.sideButton}>
        <Button variant="cyan" icon="Send" onPress={onSendClick} layout="circle" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30, // Safe area offset + visual padding
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 50,
  },
  sideButton: {
    // Allows interaction to pass through to screen behind if we used pointerEvents="box-none" on parent
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 52,
    borderRadius: 26,
    padding: 5,
    backgroundColor: '#FFF5E1', // From TMA
    borderWidth: 2,
    borderColor: '#1A1A1A', // Base neo-brutalism border
    // Added shadow to roughly match TMA's multi-layered box-shadow
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
});
