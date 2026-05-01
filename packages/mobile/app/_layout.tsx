import { AUTH_STATUS, useAuthStore } from '@unbogi/shared';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GlobalBackground, SplashScreen } from '@/shared/ui';
import { colors } from '@/theme';
import { InviteModal, SendFormModal } from '@/ui';

function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { status, initialize } = useAuthStore();

  useEffect(() => {
    // Initialize without initData for Mobile app
    const unsubscribe = initialize('');
    return () => unsubscribe();
  }, [initialize]);

  useEffect(() => {
    if (status === AUTH_STATUS.LOADING || status === AUTH_STATUS.IDLE) return;

    const inAuthGroup = segments[0] === 'login';

    if (status === AUTH_STATUS.UNAUTHENTICATED && !inAuthGroup) {
      router.replace('/login');
    } else if (status === AUTH_STATUS.AUTHENTICATED && inAuthGroup) {
      router.replace('/(main)');
    }
  }, [status, segments, router]);

  return status;
}

/**
 * Root layout — wraps the entire app.
 * Providers: GestureHandler (required for reanimated/gesture-handler).
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
        <InviteModal />
        <SendFormModal />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
