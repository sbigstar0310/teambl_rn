// app/auth/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import HomeIcon from '@/assets/bottomtab/HomeIcon.svg';
import HomeIconActive from '@/assets/bottomtab/HomeIconActive.svg';
import ProjIcon from '@/assets/bottomtab/ProjIcon.svg';
import ProjIconActive from '@/assets/bottomtab/ProjIconActive.svg';
import SearchIcon from '@/assets/bottomtab/SearchIcon.svg';
import SearchIconActive from '@/assets/bottomtab/SearchIconActive.svg';
import DefaultProfile from '@/assets/DefaultProfile.svg';

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 54,
        },
        tabBarIcon: ({ focused }) => {
          switch (route.name) {
            case 'home':
              return focused ? <HomeIconActive width={24} height={24} /> : <HomeIcon width={24} height={24} />;
            case 'projects':
              return focused ? <ProjIconActive width={24} height={24} /> : <ProjIcon width={24} height={24} />;
            case 'search':
              return focused ? <SearchIconActive width={20} height={20} /> : <SearchIcon width={20} height={20} />;
            case 'myprofile':
              return (
                <View
                  style={{
                    borderColor: focused ? '#2546F3' : '#595959',
                    borderWidth: 1,
                    borderRadius: 50,
                  }}
                >
                  <DefaultProfile width={20} height={20} />
                </View>
              );
          }
        },
        tabBarLabel: ({ focused }) => (
          <Text
            style={{
              color: focused ? '#2546F3' : '#595959',
              fontSize: 10,
            }}
          >
            {route.name === "home" && "홈"}
            {route.name === "projects" && "프로젝트"}
            {route.name === "search" && "탐색"}
            {route.name === "myprofile" && "마이페이지"}
          </Text>
        ),
      })}
    >
      <Tabs.Screen name="home"/>
      <Tabs.Screen name="projects"/>
      <Tabs.Screen name="search"/>
      <Tabs.Screen name="myprofile"/>
    </Tabs>
  );
};

export default TabsLayout;
