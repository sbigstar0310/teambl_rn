import theme from '@/shared/styles/theme';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Image, Text, Modal, ActivityIndicator } from 'react-native';
import ChonIcon from '@/assets/chon-icon.svg';
import PadoIcon from '@/assets/pado-icon.svg';
import DefaultImage from '@/assets/DefaultProfile.svg';
import ImageUploadModal from './ImageUploadModal';

const NewProfileHeader = (props: any) => {
    const {
        userId,
        isMyProfile,
        onBackClick
    } = props;

    const router = useRouter();

    const [isImageUploadModalVisible, setIsImageUploadModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [currentImageURL, setCurrentImageURL] = useState("https://image.fnnews.com/resource/media/image/2024/10/10/202410100737527065_l.jpg");

    const fetchUserInfo = async () => {
        setCurrentImageURL("https://image.fnnews.com/resource/media/image/2024/10/10/202410100737527065_l.jpg");
        // TODO: backend
    };

    const uploadImage = async (file: any): Promise<void> => {
        try {
            setIsImageUploadModalVisible(false);
            setIsLoading(true);
            // TODO : backend
            // fake delay
            await new Promise((resolve) => setTimeout(resolve, 3000));
            setCurrentImageURL(file.uri);
        } catch (error) {
            console.error("파일 업로드 중 오류 발생:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const removeImage = async () => {
        // TODO : backend
        setIsImageUploadModalVisible(false);
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        setIsLoading(false);
        setCurrentImageURL("");
    }

    useEffect(() => {
        fetchUserInfo();
    }, []);

    return (
        <>
            {/** loader */}
            {isLoading && (
                <Modal visible={true} transparent>
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                </Modal>
            )}
            <View
                style={[styles.container]}
            >
                <View
                    style={[styles.headerContainer]}
                >
                    <TouchableOpacity
                        style={[styles.profileImageContainer]}
                        onPress={() => setIsImageUploadModalVisible(true)}
                    >
                        {
                            (currentImageURL === "") && (
                                <DefaultImage
                                    width={90}
                                    height={90}
                                    style={[styles.profileImage]}
                                />
                            )
                        }
                        {
                            (currentImageURL !== "") && (
                                <Image
                                    source={{
                                        uri: currentImageURL
                                    }}
                                    style={[styles.profileImage]}
                                />
                            )
                        }
                    </TouchableOpacity>
                    {/** image upload modal */}
                    {
                        (!isLoading) && (
                            <ImageUploadModal
                                isVisible={isImageUploadModalVisible}
                                onClose={() => setIsImageUploadModalVisible(false)}
                                title={"프로필 사진"}
                                descriptions={["프로필 사진으로 신뢰도를 높여보세요.", "신뢰할 수 있는 이미지는 더 넓은 네트워크를 만듭니다."]}
                                onRemoveImage={removeImage}
                                onUploadImage={uploadImage}
                                setIsLoading={setIsLoading}
                            />
                        )
                    }
                    <View
                        style={[styles.nameContainer]}
                    >
                        <Text
                            style={[styles.name]}
                        >
                            {"성이름"}
                        </Text>
                        {isMyProfile && (
                            <TouchableOpacity
                                style={[styles.editButton]}
                                onPress={
                                    () => {
                                        router.push("/myprofile-edit");
                                    }
                                }
                            >
                                <Image
                                    source={require("@/assets/edit-icon.png")}
                                    style={[styles.editButtonIcon]}
                                />
                            </TouchableOpacity>
                        )}
                        {
                            !(isMyProfile) &&
                            <Text>
                                {"・ 1촌"}
                            </Text>
                        }
                    </View>
                    <View
                        style={[styles.schoolContainer]}
                    >
                        <Text
                            style={[styles.schoolInfo]}
                        >
                            {"카이스트"}
                        </Text>
                        <Text
                            style={[styles.sepLine]}
                        >
                            {"|"}
                        </Text>
                        <Text
                            style={[styles.schoolInfo]}
                        >
                            {"학사"}
                        </Text>
                        <Text
                            style={[styles.sepLine]}
                        >
                            {"|"}
                        </Text>
                        <Text
                            style={[styles.schoolInfo]}
                        >
                            {"18 학번"}
                        </Text>
                    </View>
                    <View
                        style={[styles.schoolContainer]}
                    >
                        <Text
                            style={[styles.schoolInfo]}
                        >
                            {"전산학부"}
                        </Text>
                        <Text
                            style={[styles.sepDot]}
                        >
                            {"・"}
                        </Text>
                        <Text
                            style={[styles.schoolInfo]}
                        >
                            {"산업디자인과"}
                        </Text>
                    </View>
                    {/*** bottom view */}
                    <View
                        style={[styles.bottomContainer]}
                    >
                        <TouchableOpacity
                            style={[styles.bottomButton, styles.withMR17]}
                        >
                            <ChonIcon
                                style={[styles.bottomButtonIcon]}
                            />
                            <Text
                                style={[styles.bottomButtonText]}
                            >
                                {"1촌 32명"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.bottomButton]}
                        >
                            <PadoIcon
                                style={[styles.bottomButtonIcon]}
                            />
                            <Text
                                style={[styles.bottomButtonText]}
                            >
                                {"파도타기"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        paddingTop: 80
    },
    backbuttonContainer: {
        paddingVertical: 16,
        paddingHorizontal: 22,
    },
    headerContainer: {
        backgroundColor: theme.colors.white,
        paddingTop: 15,
        paddingBottom: 30,
        marginTop: 17,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
    },
    profileImageContainer: {
        position: 'absolute',
        top: -45,
    },
    profileImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderColor: theme.colors.white,
        borderWidth: 4
    },
    nameContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 40,
        gap: 4
    },
    name: {
        fontSize: theme.fontSizes.smallTitle,
        fontWeight: 600,
        color: theme.colors.black
    },
    editButton: {
        width: 22,
        height: 22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    editButtonIcon: {
        width: 20,
        height: 20
    },
    chon: {
        fontSize: theme.fontSizes.body2,
        color: theme.colors.black
    },
    schoolContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    schoolInfo: {
        fontSize: theme.fontSizes.body1,
        color: theme.colors.black,
        marginHorizontal: 3
    },
    sepLine: {
        fontSize: theme.fontSizes.body2,
        color: theme.colors.black,
        paddingBottom: 3,
        marginHorizontal: 3
    },
    sepDot: {
        fontSize: theme.fontSizes.body2,
        color: theme.colors.black,
        marginHorizontal: 3
    },
    bottomContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 7
    },
    bottomButton: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    withMR17: {
        marginRight: 17
    },
    bottomButtonIcon: {
        width: 20,
        height: 20,
        marginRight: 5
    },
    bottomButtonText: {
        fontSize: theme.fontSizes.body2,
        color: theme.colors.main,
        fontWeight: 500
    },
    loadingOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    }
});


export default NewProfileHeader;