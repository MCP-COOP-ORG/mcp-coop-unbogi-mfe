import { AUTH_STATUS, useAuthStore } from '@unbogi/shared';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Svg, { Circle, Defs, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '@/theme';
import { InviteModal, SendFormModal } from '@/ui';

const BG_PATTERN = require('../assets/bg-pattern-3.png');

function GlobalBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* 1. Base Gradient & Polka Dots via SVG */}
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          {/* Top Left Cyan */}
          <RadialGradient id="grad1" cx="0%" cy="0%" r="130%" fx="0%" fy="0%">
            <Stop offset="0%" stopColor="rgb(15, 231, 234)" stopOpacity="0.91" />
            <Stop offset="100%" stopColor="rgb(15, 231, 234)" stopOpacity="0" />
          </RadialGradient>
          {/* Bottom Right Yellow */}
          <RadialGradient id="grad2" cx="100%" cy="100%" r="130%" fx="100%" fy="100%">
            <Stop offset="0%" stopColor="rgb(221, 201, 19)" stopOpacity="0.89" />
            <Stop offset="100%" stopColor="rgb(221, 201, 19)" stopOpacity="0" />
          </RadialGradient>
          {/* Center Purple */}
          <RadialGradient id="grad3" cx="50%" cy="50%" r="100%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor="rgb(106, 44, 164)" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="rgb(106, 44, 164)" stopOpacity="0" />
          </RadialGradient>

          <Pattern id="polka-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <Circle cx="12" cy="12" r="2" fill="rgba(129, 24, 205, 0.2)" />
          </Pattern>
        </Defs>

        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad1)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad2)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad3)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#polka-dots)" />
      </Svg>

      {/* 2. Cake Pattern Overlay */}
      <ImageBackground
        source={BG_PATTERN}
        style={StyleSheet.absoluteFill}
        imageStyle={{ resizeMode: 'repeat', opacity: 0.9 }}
      />
    </View>
  );
}

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
      <GlobalBackground />
      <StatusBar style="dark" />
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
      <InviteModal />
      <SendFormModal />
    </GestureHandlerRootView>
  );
}
