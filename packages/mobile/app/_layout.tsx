import { AUTH_STATUS, useAuthStore } from '@unbogi/shared';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '@/theme';

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
}

/**
 * Root layout — wraps the entire app.
 * Providers: GestureHandler (required for reanimated/gesture-handler).
 * expo-router auto-generates navigation from the `app/` directory.
 */
export default function RootLayout() {
  useProtectedRoute();
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.warmBg }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.warmBg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="(main)" options={{ animation: 'fade' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
