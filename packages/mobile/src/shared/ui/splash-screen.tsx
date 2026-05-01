import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, sizing, spacing } from '@/theme';
import { Spinner } from './spinner';

const LOGO = require('../../../assets/logo-7.png');

interface SplashScreenProps {
  /** Optional text below the spinner */
  message?: string;
}

/**
 * Consistent full-screen loading state used across the entire app.
 *
 * Renders logo + Spinner on a transparent background
 * (GlobalBackground is already rendered in root layout).
 *
 * Use cases:
 * - Auth initialization (root layout while status === IDLE | LOADING)
 * - GiftCarousel data loading
 * - Any screen initial data fetch
 */
function SplashScreenComponent({ message }: SplashScreenProps) {
  return (
    <View style={styles.container}>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      <Spinner size={28} color={colors.ink} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

export const SplashScreen = React.memo(SplashScreenComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  logo: {
    width: sizing.logoSize,
    height: sizing.logoSize,
  },
  message: {
    marginTop: spacing.sm,
    fontSize: fontSizes.base,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
