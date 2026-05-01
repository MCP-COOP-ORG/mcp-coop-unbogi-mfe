import { View } from 'react-native';
import { collectionStrategy, GiftCarousel } from '@/features/gifts';

export default function CollectionScreen() {
  return (
    <View style={{ flex: 1 }}>
      <GiftCarousel strategy={collectionStrategy} />
    </View>
  );
}
