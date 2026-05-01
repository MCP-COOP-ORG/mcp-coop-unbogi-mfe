import { StyleSheet, View } from 'react-native';
import { EmptyState, SplashScreen } from '@/shared/ui';
import { useGiftCarousel } from '../hooks/useGiftCarousel';
import type { GiftStrategy } from '../types';
import { GiftCardItem } from './GiftCardItem';
import { Slider } from './Slider';

interface GiftCarouselProps {
  strategy: GiftStrategy;
}

/** Thin orchestrator — delegates data to useGiftCarousel, renders Slider + GiftCardItem */
export function GiftCarousel({ strategy }: GiftCarouselProps) {
  const { gifts, unlockedIds, scratchedIds, isLoading, isLoaded, onScratched, resolveHoliday } =
    useGiftCarousel(strategy);

  if (!isLoaded || isLoading) {
    return <SplashScreen />;
  }

  if (gifts.length === 0) {
    return <EmptyState label={strategy.emptyLabel} />;
  }

  return (
    <View style={styles.container}>
      <Slider
        items={gifts}
        getKey={(g) => g.id}
        renderItem={(gift) => (
          <GiftCardItem
            gift={gift}
            strategy={strategy}
            isUnlocked={unlockedIds.has(gift.id)}
            isScratched={scratchedIds.has(gift.id)}
            onScratched={onScratched}
            resolveHoliday={resolveHoliday}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingTop: 80,
    paddingBottom: 80,
  },
});
