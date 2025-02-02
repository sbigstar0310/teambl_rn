
import { sharedStyles } from '@/app/_layout';
import NewProfileHeader from '@/components/NewProfileHeader';
import { Stack, useRouter } from 'expo-router';
import { usePathname, useSearchParams } from 'expo-router/build/hooks';
import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackIcon from '@/assets/BackIcon.svg';
import { ScrollProvider } from '@/components/provider/ScrollContext';

/** For the profile of other users */
const MyProfileLayout = () => {

    const myId = 1;

    return (
        <View
            style={[sharedStyles.coloredContainer, {
                paddingTop: 100
            }]}
        >
            <ScrollProvider>
                <View
                    style={{ flex: 1, paddingTop: 46 }}
                >
                    <NewProfileHeader
                        userId={myId}
                        isMyProfile={true}
                    />
                    <View
                        style={{
                            flex: 1
                        }}
                    >
                        <Stack>
                            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        </Stack>
                    </View>
                </View>
            </ScrollProvider>
        </View>
    );
}

export default MyProfileLayout;