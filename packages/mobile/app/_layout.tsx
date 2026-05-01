import { AUTH_STATUS } from '@unbogi/shared';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useProtectedRoute } from '@/features/auth';
import { GlobalBackground, SplashScreen } from '@/shared/ui';
import { colors } from '@/theme';

/**
 * Root layout — wraps the entire app.
 * Providers: SafeAreaProvider, GestureHandler (required for reanimated/gesture-handler).
 * expo-router auto-generates navigation from the `app/` directory.
 */
export default function RootLayout() {
  const status = useProtectedRoute();
  const isInitializing = status === AUTH_STATUS.IDLE || status === AUTH_STATUS.LOADING;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.warmBg }}>
        <GlobalBackground />
        <StatusBar style="dark" />
        {isInitializing ? (
          <SplashScreen />
        ) : (
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="login" options={{ animation: 'fade' }} />
            <Stack.Screen name="(main)" options={{ animation: 'fade' }} />
          </Stack>
        )}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
