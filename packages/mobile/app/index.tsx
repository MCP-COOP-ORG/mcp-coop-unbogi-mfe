import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

/**
 * Home screen — smoke test.
 * Verifies: theme tokens, expo-router, workspace linking.
 */
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎁</Text>
      <Text style={styles.heading}>UnBoGi Mobile</Text>
      <Text style={styles.caption}>Phase 1 — Foundation ✅</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.warmBg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emoji: {
    fontSize: 64,
  },
  heading: {
    ...typography.heading,
  },
  caption: {
    ...typography.caption,
  },
});
