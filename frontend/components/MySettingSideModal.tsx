import React, { useEffect, useState } from 'react';
import SideModal from './SideModal';
import { Image, StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import DefaultImage from "@/assets/DefaultProfile.svg";
import RightArrow from "@/assets/RightArrow.svg";
import theme from '@/shared/styles/theme';

interface MySettingSideModalProps {
    visible: boolean;
    onClose: () => void;
};

const MySettingSideModal: React.FC<MySettingSideModalProps> = ({
    visible,
    onClose
}) => {
    
    interface UserInfo {
        image?: string | null;
        user_name?: string;
    }
    
    const [userInfo, setUserInfo] = useState<UserInfo>({});

    const getUserInfo = async () => {
        try {
            const user = useAuthStore.getState().user;
            if (user && user.profile) {
                setUserInfo(user.profile);
                return;
            }
        } catch (error) {
            console.error('Error fetching my info:', error);
        }
    };

    useEffect(() => {
        getUserInfo();
    }, []);

    if (Object.keys(userInfo).length === 0) {
        return null;
    }
    return (
        <SideModal
            visible={visible}
            onClose={onClose}
            fixedWidth={280}
            body={
                <SafeAreaView
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        padding: 0,
                        paddingTop: 16,
                    }}
                >
                    {/** profile information */}
                    <View
                        style={styles.myProfileContainer}
                    >
                        {
                            (userInfo?.image) ? (
                                <Image
                                    source={{ uri: userInfo?.image }}
                                    style={styles.profileImage}
                                />
                            ) : (
                                <DefaultImage
                                    width={36}
                                    height={36}
                                />
                            )
                        }
                        <Text
                            style={styles.name}
                        >
                            {userInfo?.user_name}
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                console.log('Do something');
                            }}
                            style={{
                                marginLeft: 'auto'
                            }}
                        >
                            <RightArrow />
                        </TouchableOpacity>
                    </View>
                    <View
                        style={styles.settingItemContainer}
                    >
                        <TouchableOpacity
                            style={styles.settingItem}
                            onPress={() => {
                                console.log('Do something');
                            }}
                        >
                            <Text
                                style={styles.settingTitleText}
                            >
                                {"소식 받기 한 프로젝트"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.settingItem}
                            onPress={() => {
                                console.log('Do something');
                            }}
                        >
                            <Text
                                style={styles.settingTitleText}
                            >
                                {"좋아요 한 게시물"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.settingItem}
                            onPress={() => {
                                console.log('Do something');
                            }}
                        >
                            <Text
                                style={styles.settingTitleText}
                            >
                                {"1촌 신청 현황"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.settingItem}
                            onPress={() => {
                                console.log('Do something');
                            }}
                        >
                            <Text
                                style={styles.settingTitleText}
                            >
                                {"팀블 서비스 안내"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.settingItem}
                            onPress={() => {
                                console.log('Do something');
                            }}
                        >
                            <Text
                                style={styles.settingTitleText}
                            >
                                {"설정"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.settingItem}
                            onPress={() => {
                                console.log('Do something');
                            }}
                        >
                            <Text
                                style={styles.settingTitleText}
                            >
                                {"로그아웃"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            }
        />
    );
};

const styles = StyleSheet.create({
    myProfileContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 16,
        gap: 16,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.achromatic04,
    },
    profileImage : {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.colors.point,
    },
    name : {
        fontSize: theme.fontSizes.body1,
        color: theme.colors.black,
        fontWeight: 600
    },
    settingItemContainer : {
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 10,
    },
    settingItem : {
        width: '100%',
        paddingVertical: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    settingTitleText :{
        fontSize: theme.fontSizes.body1,
        color: theme.colors.black,
        fontWeight: 400
    }
});

export default MySettingSideModal;