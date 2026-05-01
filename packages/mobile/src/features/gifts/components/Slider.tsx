import React, { useCallback } from 'react';
import {
  Dimensions,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SliderProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactElement;
  getKey: (item: T) => string;
}

export function Slider<T>({ items, renderItem, getKey }: SliderProps<T>) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveIndex(Math.round(index));
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <View style={{ width: SCREEN_WIDTH, height: '100%', paddingHorizontal: 20 }}>{renderItem(item)}</View>
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        keyExtractor={getKey}
      />
      <View style={styles.pagination}>
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
  pagination: { flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 6 },
  dot: { height: 7, borderRadius: 3.5, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#000000' },
});
