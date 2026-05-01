import React, { useCallback } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, spacing } from '@/theme';

interface SliderProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactElement;
  getKey: (item: T) => string;
}

export function Slider<T>({ items, renderItem, getKey }: SliderProps<T>) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveIndex(Math.round(index));
  }, []);

  const renderSlide = useCallback(
    ({ item }: { item: T }) => <View style={[styles.slideContainer, { width: SCREEN_WIDTH }]}>{renderItem(item)}</View>,
    [renderItem, SCREEN_WIDTH],
  );

  const getItemLayout = useCallback(
    (_data: ArrayLike<T> | null | undefined, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    [SCREEN_WIDTH],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        keyExtractor={getKey}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={1}
      />
      <View style={styles.paginationContainer}>
        {items.map((item, i) => (
          <PaginationDot key={getKey(item)} isActive={i === activeIndex} />
        ))}
      </View>
    </View>
  );
}

function PaginationDot({ isActive }: { isActive: boolean }) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isActive ? 24 : 7, { duration: 300 }),
      opacity: withTiming(isActive ? 1 : 0.45, { duration: 300 }),
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 24 },
  slideContainer: { height: '100%', paddingHorizontal: 20 },
  paginationContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md, gap: 8 },
  dot: { height: 7, borderRadius: 3.5, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.ink },
});
