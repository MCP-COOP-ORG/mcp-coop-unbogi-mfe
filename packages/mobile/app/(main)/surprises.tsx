import { View } from 'react-native';
import { GiftCarousel, surprisesStrategy } from '@/features/gifts';

export default function SurprisesScreen() {
  return (
    <View style={{ flex: 1 }}>
      <GiftCarousel strategy={surprisesStrategy} />
    </View>
  );
}
