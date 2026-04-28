import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { BottomNav } from '@/ui';

export default function MainLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        tabBar={(props) => <BottomNav {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="surprises"
          options={{
            title: 'Surprises',
          }}
        />
        <Tabs.Screen
          name="collection"
          options={{
            title: 'Collection',
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
