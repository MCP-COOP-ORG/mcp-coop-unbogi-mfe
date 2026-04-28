import { useAuthStore } from '@unbogi/shared';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { Button } from '@/ui';

/**
 * Home screen — main app landing page.
 * Verifies: Auth flow and routing.
 */
export default function HomeScreen() {
  const { user, signOut } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.heading}>UnBoGi Mobile</Text>
      <Text style={styles.caption}>Phase 2 — Auth Flow ✅</Text>
      {user?.email && <Text style={styles.email}>{user.email}</Text>}

      <Button variant="cyan" onPress={() => signOut()} style={styles.button}>
        Logout
      </Button>
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
  email: {
    ...typography.body,
    marginTop: spacing.sm,
    color: '#a1a1aa', // muted
  },
  button: {
    marginTop: spacing.xl,
    width: '100%',
    maxWidth: 300,
  },
});
