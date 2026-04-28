import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const LOGO = require('../../assets/logo-7.png');

interface EmptyStateProps {
  label: string;
}

export function EmptyState({ label }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 120, // Account for custom BottomNav
    paddingHorizontal: 32,
  },
  logo: {
    width: 172,
    height: 172,
    opacity: 0.9,
  },
  label: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 2.1,
    fontWeight: '800',
    marginTop: 8,
    color: '#2b2a2c',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
