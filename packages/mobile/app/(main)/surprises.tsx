import React from 'react';
import { View } from 'react-native';
import { GiftCarousel, surprisesStrategy } from '@/ui/gifts';

export default function SurprisesScreen() {
  return (
    <View style={{ flex: 1 }}>
      <GiftCarousel strategy={surprisesStrategy} />
    </View>
  );
}
