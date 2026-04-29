import React from 'react';
import { View } from 'react-native';
import { collectionStrategy, GiftCarousel } from '@/ui/gifts';

export default function CollectionScreen() {
  return (
    <View style={{ flex: 1 }}>
      <GiftCarousel strategy={collectionStrategy} />
    </View>
  );
}
