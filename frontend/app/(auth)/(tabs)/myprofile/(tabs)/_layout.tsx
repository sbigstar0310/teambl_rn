import theme from '@/shared/styles/theme';
import { Tabs } from 'expo-router';
import React from 'react';

const MyProfileTabLayout = () => {
    return (
        <Tabs
            screenOptions={({ navigation }) => ({
                headerShown: false,
                tabBarActiveTintColor: theme.colors.main,
                tabBarInactiveTintColor: theme.colors.achromatic01,
                tabBarLabelStyle: {
                    fontSize: theme.fontSizes.subtitle,
                    fontWeight: '600',
                },
                tabBarStyle: {
                    backgroundColor: theme.colors.white,
                    height: 42,
                    padding: 0,
                    border: 'none'
                },
                tabBarItemStyle: {
                    padding: 0,
                    height: 42,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderBottomWidth: 2,
                    borderBottomColor: navigation.isFocused() ? theme.colors.main : theme.colors.white,
                },
                animation: 'shift',
                tabBarPosition: 'top',
                tabBarIcon: () => null,
                tabBarIconStyle: {
                    display: 'none',
                },
            })}
        >
            <Tabs.Screen name="project" options={{ title: '프로젝트' }} />
            <Tabs.Screen name="info" options={{ title: '정보' }} />
        </Tabs>
    );
};

export default MyProfileTabLayout;
