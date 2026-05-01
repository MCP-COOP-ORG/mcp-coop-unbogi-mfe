import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, neoBrut, sizing, spacing } from '@/theme';

const LOGO = require('../../../assets/logo-7.png');

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
    paddingBottom: 120,
    paddingHorizontal: spacing.xl,
  },
  logo: {
    width: sizing.emptyStateLogo,
    height: sizing.emptyStateLogo,
    opacity: 0.9,
  },
  label: {
    fontSize: fontSizes.base,
    textTransform: 'uppercase',
    letterSpacing: 2.1,
    fontWeight: '800',
    marginTop: spacing.sm,
    color: colors.text,
    ...neoBrut.textShadow,
  },
});
