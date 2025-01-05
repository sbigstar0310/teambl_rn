// app/auth/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

const TabsLayout = () => {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="home" options={{ title: 'Home' }} />
        <Tabs.Screen name="projects" options={{ title: 'Projects' }} />
        <Tabs.Screen name="search" options={{ title: 'Search' }} />
    </Tabs>
  );
};

export default TabsLayout;
