import { RefreshCw } from 'lucide-react-native';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

interface SpinnerProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 24, color = '#1a1a1a', strokeWidth = 2.5 }) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <RefreshCw size={size} color={color} strokeWidth={strokeWidth} />
    </Animated.View>
  );
};
