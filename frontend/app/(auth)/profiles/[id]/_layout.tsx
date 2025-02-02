
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
const ProfileDetailLayout = () => {

    const id = useSearchParams().get('id');

    const router = useRouter();
    const pathname = usePathname();

    const handleBackClick = () => {
        if (pathname.endsWith("/project")) {
            router.back();
        } else {
            router.back();
            setTimeout(() => {
                router.back();
            }, 50);
        }
    };

    return (
        <View
            style={[sharedStyles.coloredContainer]}
        >
            <SafeAreaView
                edges={['top']}
            >
                <View
                    style={[styles.backbuttonContainer]}
                >
                    <TouchableOpacity
                        onPress={handleBackClick}
                    >
                        <BackIcon />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            <ScrollProvider>
                <View
                    style={{ flex: 1, paddingTop: 46 }}
                >
                    <NewProfileHeader
                        userId={id}
                        isMyProfile={false}
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

const styles = StyleSheet.create({
    backbuttonContainer: {
        paddingVertical: 16,
        paddingHorizontal: 22
    },
});

export default ProfileDetailLayout;