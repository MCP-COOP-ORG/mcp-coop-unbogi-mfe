import type React from 'react';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface FlipFlapProps {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped: boolean;
}

export function FlipFlap({ front, back, isFlipped }: FlipFlapProps) {
  const flipValue = useSharedValue(isFlipped ? 1 : 0);

  useEffect(() => {
    flipValue.value = withTiming(isFlipped ? 1 : 0, { duration: 600 });
  }, [isFlipped, flipValue]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipValue.value, [0, 1], [0, 180], Extrapolation.CLAMP);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      zIndex: flipValue.value < 0.5 ? 1 : 0,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipValue.value, [0, 1], [-180, 0], Extrapolation.CLAMP);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      zIndex: flipValue.value >= 0.5 ? 1 : 0,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, frontAnimatedStyle]}>{front}</Animated.View>
      <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>{back}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ perspective: 1000 }],
  },
  card: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    // Initial hidden state if needed, handled by animation
  },
});
