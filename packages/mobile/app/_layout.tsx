import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '@/theme';

/**
 * Root layout — wraps the entire app.
 * Providers: GestureHandler (required for reanimated/gesture-handler).
 * expo-router auto-generates navigation from the `app/` directory.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.warmBg }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.warmBg },
          animation: 'slide_from_right',
        }}
      />
    </GestureHandlerRootView>
  );
}
