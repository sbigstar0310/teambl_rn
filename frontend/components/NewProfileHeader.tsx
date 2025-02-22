import theme from "@/shared/styles/theme";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    TouchableOpacity,
    View,
    Image,
    Text,
    Modal,
    ActivityIndicator,
    Animated,
} from "react-native";
import ChonIcon from "@/assets/chon-icon.svg";
import PadoIcon from "@/assets/pado-icon.svg";
import DefaultImage from "@/assets/DefaultProfile.svg";
import ImageUploadModal from "./ImageUploadModal";
import SmallButton from "./buttons/SmallButton";
import RelationShipBridgeView from "./RelationShipBridgeView";
import updateProfile from "@/libs/apis/Profile/updateProfile";
import createFriend from "@/libs/apis/Friend/createFriend";
import getProfile from "@/libs/apis/Profile/getProfile";
import getUserDistance from "@/libs/apis/getUserDistance";
import getUserPath from "@/libs/apis/getUserPath";
import { useScroll } from "./provider/ScrollContext";
import { useAuthStore } from "@/store/authStore";
import deleteFriend from "@/libs/apis/Friend/deleteFriend";
import fetchFriendList from "@/libs/apis/Friend/fetchFriendList";
import isFriendRequested from "@/libs/apis/Friend/isFriendRequested";

type UserInfo = {
    profile: api.Profile;
    choneDegree?: number;
    chonInfoFromMe?: {
        paths_name: string[];
        paths_id: number[];
        current_user_id: number;
        target_user_id: number;
    };
    isOneChonRequested: boolean;
};

const NewProfileHeader = (props: any) => {
    const { userId, isMyProfile } = props;
    const router = useRouter();
    const myId = useAuthStore.getState().user!.id;

    const [isImageUploadModalVisible, setIsImageUploadModalVisible] =
        useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFriendRequesting, setIsFriendRequesting] = useState(false);
    const [isFriendCanceling, setIsFriendCanceling] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo>();
    const [currentImageURL, setCurrentImageURL] = useState("");

    const fetchUserInfo = async () => {
        try {
            setIsLoading(true);

            // Fetch user profile
            let profile;
            if (isMyProfile) {
                const user = useAuthStore.getState().user;
                profile = user?.profile ?? (await getProfile(userId));
            } else {
                profile = await getProfile(userId);
            }

            // Fetch choneDegree
            const choneDegree = isMyProfile
                ? 0
                : await getUserDistance(userId).then((res) => {
                      return res.distance;
                  });

            // Fetch chonInfoFromMe
            const pathInfo = isMyProfile
                ? {
                      paths_name: [],
                      paths_id: [],
                      current_user_id: myId,
                      target_user_id: userId,
                  }
                : await getUserPath(userId);

            // Check isOneChonRequested
            const isOneChonRequested = await isFriendRequested({
                user1_id: Number(userId),
                user2_id: myId,
            });

            // Update state correctly
            setUserInfo({
                profile: profile,
                choneDegree: choneDegree,
                chonInfoFromMe: pathInfo,
                isOneChonRequested: isOneChonRequested.isRequested,
            });

            // TODO: get chonInfoFromMe
        } catch (error) {
            console.error("프로필 정보를 불러오는 중 오류 발생:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const uploadImage = async (file: any): Promise<void> => {
        try {
            setIsImageUploadModalVisible(false);
            setIsLoading(true);
            await updateProfile({
                profile: undefined,
                imageFile: {
                    uri: file.uri,
                    type: file.mimeType,
                    name: file.fileName,
                },
            });
            setCurrentImageURL(file.uri);
        } catch (error) {
            console.error("파일 업로드 중 오류 발생:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const removeImage = async () => {
        setIsImageUploadModalVisible(false);
        setIsLoading(true);
        // Upload the image
        try {
            await updateProfile({
                profile: { image: null },
                imageFile: undefined,
            });
        } catch (error) {
            console.error("이미지 삭제 중 오류 발생:", error);
        } finally {
            setIsLoading(false);
        }

        setIsLoading(false);
        setCurrentImageURL("");
    };

    const createFriendRequest = async () => {
        try {
            setIsFriendRequesting(true);
            // Send friend request
            await createFriend({ to_user: userId });

            console.log("Friend request sent successfully!");
        } catch (error) {
            console.error("Failed to create friend request:", error);
        } finally {
            setIsFriendRequesting(false);
            router.replace(`/profiles/${userId}`); // 현재 페이지 다시 로드
        }
    };

    const cancelFriendRequest = async () => {
        try {
            setIsFriendCanceling(true);
            const current_user_id = useAuthStore.getState().user!.id;
            const friendList = await fetchFriendList(current_user_id);

            // Find the friend relationship where the current user and target user are linked
            const friend = friendList.find((friend) => {
                return (
                    (friend.from_user.id === current_user_id &&
                        friend.to_user.id === Number(userId)) ||
                    (friend.from_user.id === Number(userId) &&
                        friend.to_user.id === current_user_id)
                );
            });

            if (!friend) {
                console.warn("Friend request not found or already canceled.");
                return;
            }

            // Delete the friend request
            await deleteFriend(friend.id);

            // refetch user info (to update the choneDegree)
            fetchUserInfo();
            console.log("Friend request successfully canceled.");
        } catch (error) {
            console.error("Failed to cancel friend request:", error);
        } finally {
            setIsFriendCanceling(false);
        }
    };

    const openUserChat = async () => {
        router.push(`/conversations/with/${userId}`);
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    useEffect(() => {
        setCurrentImageURL(
            userInfo?.profile.image ? userInfo.profile.image : ""
        );
    }, [userInfo]);

    /** NEW : for the shrinking */
    const scrollY = useScroll() || new Animated.Value(0);
    const [headerHeight, setHeaderHeight] = useState<number | null>(null);

    const animatedHeight = scrollY.interpolate({
        inputRange: [0, 10, 200],
        outputRange: [headerHeight || 100, headerHeight || 100, 50],
        extrapolate: "clamp",
    });

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
            <Animated.View
                style={{
                    height: headerHeight ? animatedHeight : undefined,
                    backgroundColor: "white",
                    minHeight: 100,
                }}
                onLayout={(event) => {
                    if (headerHeight === null) {
                        setHeaderHeight(event.nativeEvent.layout.height);
                    }
                }}
            >
                <View style={styles.profileContainer}>
                    <View style={[styles.headerContainer]}>
                        <TouchableOpacity
                            style={[styles.profileImageContainer]}
                            onPress={() => {
                                if (isMyProfile) {
                                    setIsImageUploadModalVisible(true);
                                }
                            }}
                        >
                            {currentImageURL === "" && (
                                <DefaultImage
                                    width={90}
                                    height={90}
                                    style={[styles.profileImage]}
                                />
                            )}
                            {currentImageURL !== "" && (
                                <Image
                                    source={{
                                        uri: currentImageURL,
                                    }}
                                    style={[styles.profileImage]}
                                />
                            )}
                        </TouchableOpacity>
                        {/** image upload modal */}
                        {!isLoading && (
                            <ImageUploadModal
                                isVisible={isImageUploadModalVisible}
                                onClose={() =>
                                    setIsImageUploadModalVisible(false)
                                }
                                title={"프로필 사진"}
                                descriptions={[
                                    "프로필 사진으로 신뢰도를 높여보세요.",
                                    "신뢰할 수 있는 이미지는 더 넓은 네트워크를 만듭니다.",
                                ]}
                                onRemoveImage={removeImage}
                                onUploadImage={uploadImage}
                                setIsLoading={setIsLoading}
                            />
                        )}
                        <View style={[styles.nameContainer]}>
                            <Text style={[styles.name]}>
                                {userInfo?.profile.user_name}
                            </Text>
                            {isMyProfile && (
                                <TouchableOpacity
                                    style={[styles.editButton]}
                                    onPress={() => {
                                        router.push("/myprofile-edit");
                                    }}
                                >
                                    <Image
                                        source={require("@/assets/edit-icon.png")}
                                        style={[styles.editButtonIcon]}
                                    />
                                </TouchableOpacity>
                            )}
                            {!isMyProfile && (
                                <Text>{`・ ${
                                    userInfo?.choneDegree
                                        ? `${userInfo?.choneDegree}촌`
                                        : `4촌 이상`
                                }`}</Text>
                            )}
                        </View>
                        <View style={[styles.schoolContainer]}>
                            <Text style={[styles.schoolInfo]}>
                                {userInfo?.profile.school}
                            </Text>
                            <Text style={[styles.sepLine]}>{"|"}</Text>
                            <Text style={[styles.schoolInfo]}>
                                {userInfo?.profile.current_academic_degree}
                            </Text>
                            <Text style={[styles.sepLine]}>{"|"}</Text>
                            <Text style={[styles.schoolInfo]}>
                                {userInfo?.profile.year
                                    ? `${userInfo.profile.year % 100} 학번`
                                    : ""}
                            </Text>
                        </View>
                        <View style={[styles.schoolContainer]}>
                            <Text style={[styles.schoolInfo]}>
                                {userInfo?.profile.major1 ?? ""}
                            </Text>
                            {userInfo?.profile.major2 && (
                                <>
                                    <Text style={[styles.sepDot]}>{"·"}</Text>
                                    <Text style={[styles.schoolInfo]}>
                                        {userInfo?.profile.major2}
                                    </Text>
                                </>
                            )}
                        </View>
                        {/*** bottom view */}
                        <View style={[styles.bottomContainer]}>
                            <TouchableOpacity
                                style={[styles.bottomButton, styles.withMR17]}
                                onPress={
                                    isMyProfile
                                        ? () => router.push("/myfriends")
                                        : () =>
                                              router.push({
                                                  pathname: "/oneChon",
                                                  params: {
                                                      target_user_id_string:
                                                          userId,
                                                  },
                                              })
                                }
                            >
                                <ChonIcon style={[styles.bottomButtonIcon]} />
                                <Text style={[styles.bottomButtonText]}>
                                    {`1촌 ${userInfo?.profile.one_degree_count}명`}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.bottomButton]}
                                onPress={() => {
                                    router.push({
                                        pathname: "/padotaki",
                                        params: {
                                            current_target_user_id:
                                                userId.toString(),
                                            userName:
                                                userInfo?.profile.user_name,
                                        },
                                    });
                                }}
                            >
                                <PadoIcon style={[styles.bottomButtonIcon]} />
                                <Text style={[styles.bottomButtonText]}>
                                    {"파도타기"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {/** requesting 1-chon & sending message */}
                        {!isMyProfile && (
                            <View style={styles.requestAndMessageContainer}>
                                {userInfo?.choneDegree !== 1 &&
                                    !userInfo?.isOneChonRequested && (
                                        <SmallButton
                                            text={"1촌 신청"}
                                            onClickCallback={
                                                createFriendRequest
                                            }
                                            isLoading={isFriendRequesting}
                                        />
                                    )}
                                {userInfo?.choneDegree !== 1 &&
                                    userInfo?.isOneChonRequested && (
                                        <SmallButton
                                            text={"수락 대기"}
                                            onClickCallback={async () => {
                                                //TODO
                                            }}
                                            isLoading={false}
                                            type={"disabled"}
                                        />
                                    )}
                                {userInfo?.choneDegree === 1 && (
                                    <SmallButton
                                        text={"1촌 취소"}
                                        onClickCallback={cancelFriendRequest}
                                        isLoading={isFriendCanceling}
                                        type={"secondary"}
                                    />
                                )}
                                <SmallButton
                                    text={"메시지"}
                                    onClickCallback={openUserChat}
                                    isLoading={false}
                                    type={"secondary"}
                                />
                            </View>
                        )}
                        {/** bridge view */}
                        {userInfo?.choneDegree != null &&
                            userInfo?.choneDegree !== 1 &&
                            !isMyProfile && (
                                <View style={styles.bridgeContainer}>
                                    <Text style={styles.bridgeTitle}>
                                        {"나와의 관계"}
                                    </Text>
                                    <RelationShipBridgeView
                                        startName={userInfo?.profile.user_name}
                                        endName={userInfo?.chonInfoFromMe?.paths_name.findLast(
                                            () => true
                                        )}
                                        relationShipList={
                                            userInfo?.chonInfoFromMe?.paths_name
                                        }
                                        distance={userInfo?.choneDegree}
                                        isLoading={false}
                                    />
                                </View>
                            )}
                    </View>
                </View>
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    profileContainer: {
        flexDirection: "column",
        paddingTop: 0,
    },
    backbuttonContainer: {
        paddingVertical: 16,
        paddingHorizontal: 22,
        paddingBottom: 46,
    },
    headerContainer: {
        backgroundColor: theme.colors.white,
        paddingTop: 15,
        paddingBottom: 30,
        marginTop: 17,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
    },
    profileImageContainer: {
        position: "absolute",
        top: -45,
    },
    profileImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderColor: theme.colors.white,
        borderWidth: 4,
    },
    nameContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 40,
        gap: 4,
    },
    name: {
        fontSize: theme.fontSizes.smallTitle,
        fontWeight: 600,
        color: theme.colors.black,
    },
    editButton: {
        width: 22,
        height: 22,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    editButtonIcon: {
        width: 20,
        height: 20,
    },
    chon: {
        fontSize: theme.fontSizes.body2,
        color: theme.colors.black,
    },
    schoolContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    schoolInfo: {
        fontSize: theme.fontSizes.body1,
        color: theme.colors.black,
        marginHorizontal: 3,
    },
    sepLine: {
        fontSize: theme.fontSizes.body2,
        color: theme.colors.black,
        paddingBottom: 3,
        marginHorizontal: 3,
    },
    sepDot: {
        fontSize: theme.fontSizes.body2,
        color: theme.colors.black,
        marginHorizontal: 3,
    },
    bottomContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 7,
    },
    bottomButton: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    withMR17: {
        marginRight: 17,
    },
    bottomButtonIcon: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    bottomButtonText: {
        fontSize: theme.fontSizes.body2,
        color: theme.colors.main,
        fontWeight: 500,
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
    },
    requestAndMessageContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        marginTop: 20,
        paddingHorizontal: 20,
    },
    bridgeContainer: {
        display: "flex",
        width: "100%",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingHorizontal: 20,
        marginTop: 20,
    },
    bridgeTitle: {
        fontSize: theme.fontSizes.subtitle,
        color: theme.colors.black,
        fontWeight: 600,
        marginBottom: 12,
    },
});

export default NewProfileHeader;
