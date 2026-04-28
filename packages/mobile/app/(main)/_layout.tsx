import { Tabs } from 'expo-router';
import { colors } from '@/theme';

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#faf6ee', // warmBg
          borderTopWidth: 2,
          borderTopColor: '#1a1a1a', // ink
        },
        tabBarActiveTintColor: '#1a1a1a',
        tabBarInactiveTintColor: '#a1a1aa',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
    </Tabs>
  );
}
