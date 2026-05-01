import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { BottomNav } from '@/shared/ui';
import { InviteModal } from '@/features/invite';
import { SendFormModal } from '@/features/send-gift';

export default function MainLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        initialRouteName="surprises"
        tabBar={(props) => <BottomNav {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: 'transparent' },
        }}
      >
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
      <InviteModal />
      <SendFormModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
