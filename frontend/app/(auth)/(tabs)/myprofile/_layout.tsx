
import { sharedStyles } from '@/app/_layout';
import NewProfileHeader from '@/components/NewProfileHeader';
import { Stack, useRouter } from 'expo-router';
import { usePathname, useSearchParams } from 'expo-router/build/hooks';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SettingIcon from '@/assets/SettingIcon.svg';
import { ScrollProvider } from '@/components/provider/ScrollContext';
import SideModal from '@/components/SideModal';
import MySettingSideModal from '@/components/MySettingSideModal';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { useAuthStore } from '@/store/authStore';

/** For the profile of other users */
const MyProfileLayout = () => {

    const [myId, setMyId] = useState<number>(-99);

    const getMyId = async () => {
        const user = useAuthStore.getState().user;
        if (user && user.id) {
            setMyId(Number(user.id));
        }
    }

    const [isSettingMenuVisible, setIsSettingMenuVisible] = useState(false);

    useEffect(() => {
        getMyId();
    }, []);

    if (myId === -99) {
        return null;
    }
    return (
        <View
            style={[sharedStyles.coloredContainer, {
                paddingTop: 100
            }]}
        >
            <ScrollProvider>
                <View
                    style={{ flex: 1, paddingTop: 46, position: 'relative' }}
                >
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: -46,
                            right: 0,
                            padding: 16
                        }}
                        onPress={() => setIsSettingMenuVisible(true)}
                    >
                        <SettingIcon />
                    </TouchableOpacity>
                    {/** setting slider */}
                    <MySettingSideModal
                        visible={isSettingMenuVisible}
                        onClose={() => setIsSettingMenuVisible(false)}
                    />
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

const styles = StyleSheet.create({

});

export default MyProfileLayout;