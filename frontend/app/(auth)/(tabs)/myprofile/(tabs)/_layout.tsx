import theme from '@/shared/styles/theme';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

const MyProfileTabLayout = () => {
    return (
        <View
            style={{
                flex: 1,
            }}
        >
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
                        border: 'none',
                        paddingBottom: 0,
                        paddingTop: 0,
                        height: 42,
                        borderBottomWidth: 0
                    },
                    tabBarItemStyle: {
                        paddingBottom: 0,
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
                    }
                })}
            >
                <Tabs.Screen name="project" options={{ title: '프로젝트' }} />
                <Tabs.Screen name="info" options={{ title: '정보' }} />
            </Tabs>
        </View>
    );
};

export default MyProfileTabLayout;
