import { RefreshCw } from 'lucide-react-native';
import React, { useEffect } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { colors, iconDefaults } from '@/theme';

interface SpinnerProps {
  /** Icon size in logical pixels */
  size?: number;
  /** Spinner color — defaults to `colors.ink` */
  color?: string;
  /** Icon stroke width */
  strokeWidth?: number;
}

/** Animated spinner on UI-thread via Reanimated worklets. */
function SpinnerComponent({
  size = iconDefaults.size,
  color = colors.ink,
  strokeWidth = iconDefaults.strokeWidth,
}: SpinnerProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1, // infinite
      false,
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <RefreshCw size={size} color={color} strokeWidth={strokeWidth} />
    </Animated.View>
  );
}

export const Spinner = React.memo(SpinnerComponent);
