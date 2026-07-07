import React from 'react';
import { Tabs } from 'expo-router';
import CustomTabBar from '@/components/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index"     options={{ title: 'Início'      }} />
      <Tabs.Screen name="vocab"     options={{ title: 'Vocabulário' }} />
      <Tabs.Screen name="search"    options={{ title: 'Buscar'      }} />
      <Tabs.Screen name="bookmarks" options={{ title: 'Favoritos'   }} />
      <Tabs.Screen name="settings"  options={{ title: 'Você'        }} />
    </Tabs>
  );
}
